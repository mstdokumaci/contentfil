const crypto = require('crypto')

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
      content: ''
    }
  })
  branchDraft.root().get('route').set(`/me/draft/${id}`)
}

const publishDraft = (master, id, __, branchDraft) => {
  const draft = branchDraft.get(id)
  if (draft === void 0) {
    return
  }
  master.get('published').set({
    [ id ]: {
      content: draft.get('content').compute(),
      date: Date.now(),
      author: branchDraft.root().get([ 'user', 'email' ]).compute()
    }
  })
  draft.set({
    published: [ '@', 'published', id ]
  })
}

module.exports = master => ({
  createDraft,
  publishDraft: publishDraft.bind(null, master)
})
