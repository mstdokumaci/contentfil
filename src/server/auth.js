const { createPersist } = require('stx')
const { PersistRiak } = require('stx-persist-riak')
const crypto = require('crypto')

let auth

createPersist({}, new PersistRiak([ '127.0.0.1' ], 'auth'))
  .then(authState => {
    auth = authState
  })

const setErrorStatus = user => {
  if (user.get('type') !== void 0) {
    user.set({ status: 'error' })
  }
}

const createUser = (user, _, branchUser) => {
  try {
    user = JSON.parse(user)
  } catch (e) {
    return setErrorStatus(branchUser)
  }
  const { email, password } = user
  if (auth.get(email) !== void 0) {
    return setErrorStatus(branchUser)
  }
  const salt = crypto.randomBytes(64)
  const hash = crypto.scryptSync(password, salt, 64).toString('base64')
  auth.set({
    [ email ]: {
      salt: salt.toString('base64'),
      hash
    }
  })
  branchUser.set({ status: 'created' })
}

const loadUser = async (switcher, email, token, user) => {
  const userBranch = await switcher(
    email, new PersistRiak([ '127.0.0.1' ], `user-${email}`)
  )

  if (userBranch.get([ 'user', 'type' ]) === void 0) {
    userBranch.get('user').set({
      type: 'real',
      email,
      token,
      tokenExpiresAt: user.get('tokenExpiresAt').compute()
    })
  }
}

const authByPassword = async (email, password, switcher) => {
  const user = auth.get(email)
  if (user !== void 0) {
    const salt = Buffer.from(user.get('salt').compute(), 'base64')
    const hash = crypto.scryptSync(password, salt, 64).toString('base64')
    if (user.get('hash').compute() === hash) {
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
  try {
    authRequest = JSON.parse(branchKey)
  } catch (e) {
    return setErrorStatus(branchUser)
  }
  if (!authRequest.type) {
    setErrorStatus(branchUser)
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
    return authByToken(authRequest.email, authRequest.token, switcher) ||
      setErrorStatus(branchUser)
  } else if (
    authRequest.type === 'password' &&
    authRequest.email &&
    authRequest.password
  ) {
    return authByPassword(authRequest.email, authRequest.password, switcher) ||
      setErrorStatus(branchUser)
  } else {
    setErrorStatus(branchUser)
  }
}

module.exports = {
  createUser,
  switchBranch
}
