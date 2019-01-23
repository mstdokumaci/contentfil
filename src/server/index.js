const { create } = require('stx')

const auth = create()

const createUser = ({ email, password }, _, branchUser) => {
  let salt = Buffer.from(Array(64).fill().map(() => Math.random() * 255))
  const hash = crypto.scryptSync(password, salt, 64).toString('base64')
  salt = salt.toString('base64')
  token = Buffer.from(
    Array(64).fill().map(() => Math.random() * 255)
  ).toString('base64')
  auth.set({
    [ email ]: {
      salt,
      hash,
      token,
      tokenExpiresAt: Date.now() + 86400 * 1000 * 10
    }
  })
  branchUser.emit('created')
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
        token = Buffer.from(
          Array(64).fill().map(() => Math.random() * 255)
        ).toString('base64')
        user.set({
          token,
          tokenExpiresAt: Date.now() + 86400 * 1000 * 10
        })
      }
      switcher(email).get('user').set({
        type: 'real',
        email,
        token,
        tokenExpiresAt: tokenExpiresAt.compute()
      })
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
    }
  }
}

const contentfil = create({
  user: {
    type: 'anonymous'
  },
  route: {},
  draft: {},
  published: {}
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
server.switchBranch = (_, branchKey, switcher) => {
  try {
    authRequest = JSON.parse(branchKey)
  } catch (e) {
    return
  }
  if (!authRequest.type) {
    return
  } else if (
    authRequest.type === 'anonymous'
    && authRequest.id
  ) {
    switcher(authRequest.id)
  } else if (
    authRequest.type === 'token'
    && authRequest.email
    && authRequest.token
  ) {
    authByToken(authRequest.email, authRequest.token, switcher)
  } else if (
    authRequest.type === 'password'
    && authRequest.email
    && authRequest.password
  ) {
    authByPassword(authRequest.email, authRequest.password, switcher)
  }
}
