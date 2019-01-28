const { create } = require('stx')
const crypto = require('crypto')

const auth = create()

setErrorStatus = user => {
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

const authByPassword = (email, password, switcher) => {
  const user = auth.get(email)
  if (user !== void 0) {
    const salt = Buffer.from(user.get('salt').compute(), 'base64')
    const hash = crypto.scryptSync(password, salt, 64).toString('base64')
    if (user.get('hash').compute() === hash) {
      const tokenExpiresAt = user.get('tokenExpiresAt')
      let token
      if (
        tokenExpiresAt !== void 0
        && tokenExpiresAt.compute() > Date.now()
      ) {
        token = user.get('token').compute()
      } else {
        token = crypto.randomBytes(64).toString('base64')
        user.set({
          token,
          tokenExpiresAt: Date.now() + 86400 * 1000 * 10
        })
      }
      switcher(email).get('user').set({
        type: 'real',
        email,
        token,
        tokenExpiresAt: user.get('tokenExpiresAt').compute()
      })
      return true
    }
  }
}

const authByToken = (email, token, switcher) => {
  const user = auth.get(email)
  if (user !== void 0) {
    const tokenExpiresAt = user.get('tokenExpiresAt')
    if (
      tokenExpiresAt !== void 0
      && tokenExpiresAt.compute() > Date.now()
      && user.get('token').compute() === token 
    ) {
      switcher(email).get('user').set({
        type: 'real',
        email,
        token,
        tokenExpiresAt: tokenExpiresAt.compute()
      })
      return true
    }
  }
}

const createDraft = () => {
  const timeBuf = Buffer.allocUnsafe(4)
  timeBuf.writeUInt32BE((Date.now() & 0xffffffff) >>> 0, 0)
  const id = Buffer.concat([
      crypto.randomBytes(12),
      timeBuf
  ])
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

const contentfil = create({
  user : {},
  route: '',
  draft: {},
  published: {},
  mine_published: {}
})

contentfil.branch.newBranchMiddleware = newBranch => {
  newBranch.get('user').on('createUser', createUser)
  newBranch.branch.clientCanUpdate = [
    {
      path: ['route']
    }
  ]
}

const server = contentfil.listen(7071)
server.switchBranch = (fromBranch, branchKey, switcher) => {
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
    authRequest.type === 'anonymous'
    && authRequest.id
  ) {
    switcher(authRequest.id).get('user').set({
      type: 'anonymous',
      id: authRequest.id
    })
  } else if (
    authRequest.type === 'token'
    && authRequest.email
    && authRequest.token
  ) {
    if (!authByToken(authRequest.email, authRequest.token, switcher)) {
      setErrorStatus(branchUser)
    }
  } else if (
    authRequest.type === 'password'
    && authRequest.email
    && authRequest.password
  ) {
    if (!authByPassword(authRequest.email, authRequest.password, switcher)) {
      setErrorStatus(branchUser)
    }
  } else {
    setErrorStatus(branchUser)
  }
}
