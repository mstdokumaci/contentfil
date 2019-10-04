const { generateId } = require('./utils')

const createDraft = (_, __, branchDraft) => {
  const id = generateId()

  branchDraft.set({
    [id]: {
      content: ''
    }
  })

  branchDraft.root().get('route').set(`/me/draft/${id}`)
}

const publishDraft = (master, id, __, branchDraft) => {
  const draft = branchDraft.get(id)
  if (draft === undefined) {
    return
  }
  master.get('published').set({
    [id]: {
      content: draft.get('content').compute(),
      date: Date.now(),
      author: branchDraft.root().get(['user', 'author']).serialize()
    }
  })
  draft.set({
    published: ['@', 'published', id]
  })
}

module.exports = master => ({
  createDraft,
  publishDraft: publishDraft.bind(null, master)
})
