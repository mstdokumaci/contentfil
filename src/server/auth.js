const crypto = require('crypto')

const { createPersist } = require('stx')
const { PersistRocksDB } = require('stx-persist-rocksdb')
const {
  generateId,
  createSignedToken,
  verifySignedToken,
  sendMail
} = require('./utils')

let auth

createPersist({}, new PersistRocksDB('db/auth'))
  .then(authState => {
    auth = authState
  })

const setErrorStatus = (user, error) => {
  if (user.get('type') !== undefined) {
    user.set({ status: 'error', error })
  }
}

const sendConfirmationEmail = (name, email) => {
  const token = createSignedToken(email, Date.now() + 86400 * 1000)
  sendMail(
    email,
    name,
    'Confirm your e-mail',
    `Hi ${name}, if you want to confirm ownership of your e-mail address (${email}) with us, please click <a href="http://localhost:8080/confirm/${token}">this confirmation link</a>. Link will be valid for 24 hours. If you think it was someone else using your address, please report us by sending an e-mail back. Thank you.`
  )
}

const createUser = (master, user, _, branchUser) => {
  branchUser.set({ status: 'createStarted', error: null })

  try {
    user = JSON.parse(user)
  } catch (e) {
    return setErrorStatus(branchUser, 'Malformed user JSON')
  }

  const { name, email, password } = user

  if (!new RegExp('^[^@]+@[^@.]+(\\.[^@.]+)*$').test(email)) {
    return setErrorStatus(branchUser, 'Invalid e-mail')
  }

  if (auth.get(email) !== undefined) {
    return setErrorStatus(branchUser, 'User exists')
  }

  const id = generateId()

  const salt = crypto.randomBytes(64)
  const hash = crypto.scryptSync(password, salt, 64).toString('base64')

  sendConfirmationEmail(name, email)

  auth.set({
    [email]: {
      salt: salt.toString('base64'),
      hash,
      id,
      emailCooldownTtl: Date.now() + 30 * 1000
    }
  })
  master.get('author').set({
    [id]: { name, published: {} }
  })
  branchUser.set({ status: 'created' })
}

const resendConfirmation = (master, _, __, branchUser) => {
  const userType = branchUser.get('type')
  if (!userType || userType.compute() !== 'unconfirmed') {
    return
  }

  const email = branchUser.get('email').compute()
  const user = auth.get(email)
  const id = user.get('id').compute()
  const emailCooldownTtl = user.get('emailCooldownTtl')
  const name = master.get(['author', id, 'name']).compute()

  if (emailCooldownTtl.compute() < Date.now()) {
    emailCooldownTtl.set(Date.now() + 30 * 1000)
    sendConfirmationEmail(name, email)
  }
}

const loadUser = async (switcher, email, token, user) => {
  const userBranch = await switcher(
    email, new PersistRocksDB(`db/user/${email}`)
  )

  const branchUser = userBranch.get('user')

  if (branchUser.get('type') === undefined) {
    branchUser.set({
      type: 'unconfirmed',
      author: ['@', 'author', user.get('id').compute()],
      email,
      token,
      tokenExpiresAt: user.get('tokenExpiresAt').compute()
    })
    userBranch.set({ route: '/confirm' })
  } else {
    branchUser.set({
      token,
      tokenExpiresAt: user.get('tokenExpiresAt').compute()
    })
  }
  branchUser.emit('login')

  return userBranch
}

const refreshTokenAndLoadUser = async (switcher, email, user) => {
  const tokenExpiresAt = user.get('tokenExpiresAt')
  let token
  if (
    tokenExpiresAt !== void 0 &&
    tokenExpiresAt.compute() > Date.now()
  ) {
    token = user.get('token').compute()
  } else {
    token = crypto.randomBytes(64).toString('base64')
    user.set({
      token,
      tokenExpiresAt: Date.now() + 86400 * 1000 * 10
    })
  }
  return loadUser(switcher, email, token, user)
}

const authByPassword = async (email, password, switcher) => {
  const user = auth.get(email)
  if (user !== undefined) {
    const salt = Buffer.from(user.get('salt').compute(), 'base64')
    const hash = crypto.scryptSync(password, salt, 64).toString('base64')
    if (user.get('hash').compute() === hash) {
      return refreshTokenAndLoadUser(switcher, email, user)
    }
  }
}

const authByLinkToken = async (token, switcher) => {
  let email
  try {
    email = verifySignedToken(token)
  } catch (e) {
    return false
  }
  const user = auth.get(email)
  if (user !== undefined) {
    const userBranch = await refreshTokenAndLoadUser(switcher, email, user)
    userBranch.get('user').set({
      type: 'real'
    })
    userBranch.set({ route: '/me' })
    auth.get(email).set({
      emailCooldownTtl: null
    })
  }
}

const authByToken = async (email, token, switcher) => {
  const user = auth.get(email)
  if (user !== void 0) {
    const tokenExpiresAt = user.get('tokenExpiresAt')
    if (
      tokenExpiresAt !== void 0 &&
      tokenExpiresAt.compute() > Date.now() &&
      user.get('token').compute() === token
    ) {
      return loadUser(switcher, email, token, user)
    }
  }
}

const switchBranch = async (fromBranch, branchKey, switcher) => {
  let authRequest
  const branchUser = fromBranch.get('user')
  branchUser.set({ status: 'loginStarted', error: null })
  try {
    authRequest = JSON.parse(branchKey)
  } catch (e) {
    return setErrorStatus(branchUser, 'Malformed authentication request')
  }
  if (!authRequest.type) {
    setErrorStatus(branchUser, 'Missing authentication type')
  } else if (
    authRequest.type === 'anonymous' &&
    authRequest.id
  ) {
    const toBranch = await switcher(authRequest.id)
    toBranch.get('user').set({
      type: 'anonymous',
      id: authRequest.id
    })
  } else if (
    authRequest.type === 'token' &&
    authRequest.email &&
    authRequest.token
  ) {
    const success = await authByToken(authRequest.email, authRequest.token, switcher)
    return success || setErrorStatus(branchUser, 'Authentication failed')
  } else if (
    authRequest.type === 'password' &&
    authRequest.email &&
    authRequest.password
  ) {
    const success = await authByPassword(authRequest.email, authRequest.password, switcher)
    return success || setErrorStatus(branchUser, 'Authentication failed')
  } else if (
    authRequest.type === 'confirm' &&
    authRequest.token
  ) {
    const success = await authByLinkToken(authRequest.token, switcher)
    return success || setErrorStatus(branchUser, 'Authentication failed')
  } else {
    setErrorStatus(branchUser, 'Unknown authentication type')
  }
}

module.exports = master => ({
  createUser: createUser.bind(null, master),
  resendConfirmation: resendConfirmation.bind(null, master),
  switchBranch
})
