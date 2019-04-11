const { create } = require('stx')
const crypto = require('crypto')

const {
  createUser,
  switchBranch
} = require('./auth')

const createDraft = (_, __, branchDraft) => {
  const timeBuf = Buffer.allocUnsafe(4)
  timeBuf.writeUInt32BE((Date.now() & 0xffffffff) >>> 0, 0)
  const id = Buffer.concat([
      crypto.randomBytes(12),
      timeBuf
  ]).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  branchDraft.set({
    [ id ]: {
      content: '',
    }
  })
  branchDraft.root().get('route').set(`/draft/${id}`)
}

const publishDraft = (id, __, branchDraft) => {
  const draft = branchDraft.get(id)
  if (draft == void 0) {
    return
  }
  contentfil.get('published').set({
    [ id ]: {
      content: draft.get('content').compute(),
      date: Date.now()
    }
  })
  draft.set({
    published: [ '@', 'published', 'id' ]
  })
}

const contentfil = create({
  user : {},
  route: '',
  draft: {},
  published: {},
})

contentfil.branch.newBranchMiddleware = newBranch => {
  newBranch.get('user').on('create', createUser)
  newBranch.get('draft').on('create', createDraft)
  newBranch.get('draft').on('publish', publishDraft)
  newBranch.branch.clientCanUpdate = [
    {
      path: ['route']
    },
    {
      path: [ 'draft', '*', 'content' ]
    }
  ]
}

const server = contentfil.listen(7071)
server.switchBranch = switchBranch
