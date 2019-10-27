const { generateId } = require('./utils')

const createDraft = (_, __, branchDraft) => {
  const userType = branchDraft.root().get(['user', 'type'])
  if (!userType || userType.compute() !== 'real') {
    return
  }

  const id = generateId()

  branchDraft.set({
    [id]: {
      content: ''
    }
  })

  branchDraft.root().get('route').set(`/me/draft/${id}`)
}

const deleteDraft = (id, __, branchDraft) => {
  const draft = branchDraft.get(id)
  if (draft === undefined) {
    return
  }
  const published = draft.get('published')
  if (published) {
    draft.get('content').set(
      published.get('content').compute()
    )
    branchDraft.root().get('route').set(`/story/${id}`)
  } else {
    draft.set(null)
    branchDraft.root().get('route').set('/me')
  }
}

const publishDraft = (master, id, __, branchDraft) => {
  const draft = branchDraft.get(id)
  if (draft === undefined) {
    return
  }
  const authorId = branchDraft.root().get(['user', 'author']).serialize().pop()
  master.get('published').set({
    [id]: {
      content: draft.get('content').compute(),
      date: Date.now(),
      author: ['@', 'author', authorId],
      viewed: false,
      read: false
    }
  })
  master.get(['author', authorId]).set({
    published: {
      [id]: ['@', 'published', id]
    }
  })
  draft.set({
    published: ['@', 'published', id]
  })
}

const unPublishStory = (master, id, __, branchDraft) => {
  const draft = branchDraft.get(id)
  if (draft === undefined) {
    return
  }
  const authorId = branchDraft.root().get(['user', 'author']).serialize().pop()
  master.get(['author', authorId, 'published', id]).set(null)
  draft.get('published').set(null)
  master.get(['published', id]).set(null)
  branchDraft.root().get('route').set(`/me/draft/${id}`)
}

module.exports = master => ({
  createDraft,
  deleteDraft,
  publishDraft: publishDraft.bind(null, master),
  unPublishStory: unPublishStory.bind(null, master)
})
