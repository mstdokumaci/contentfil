const { generateId } = require('./utils')
const { getStoryStats } = require('./stats')

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
  const fresh = master.get(['published', id]) === undefined
  master.get('published').set({
    [id]: {
      content: draft.get('content').compute(),
      date: Date.now(),
      author: ['@', 'author', authorId],
      viewed: false,
      read: false,
      vote: 0
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
  if (fresh) {
    master.get('fresh').set({
      [id]: Date.now()
    })
  }
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
  const fresh = master.get(['fresh', id])
  if (fresh !== undefined) {
    fresh.set(null)
  }
  branchDraft.root().get('route').set(`/me/draft/${id}`)
}

const homeList = master => {
  const threshold = Date.now() - 10 * 86400 * 1000
  const newList = []
  master.get('fresh').forEach((time, id) => {
    const timestamp = time.compute()
    if (timestamp < threshold) {
      return time.set(null)
    }

    const stats = getStoryStats(id)
    const rank = (timestamp - threshold) / 3600 / 1000 + stats.totalVote * 2 + stats.readerCount / 10
    newList.push([id, rank])
  })
  newList.sort((a, b) => b[1] - a[1])
  newList.splice(12)
  const idList = new Set(newList.map(item => item[0]))
  const home = master.get('home')
  home.forEach((item, id) => {
    if (!idList.has(id)) {
      item.set(null)
    }
  })
  newList.forEach(item => {
    home.set({
      [item[0]]: {
        val: ['@', 'published', item[0]],
        rank: item[1]
      }
    })
  })
}

module.exports = master => ({
  createDraft,
  deleteDraft,
  publishDraft: publishDraft.bind(null, master),
  unPublishStory: unPublishStory.bind(null, master),
  homeList: homeList.bind(null, master)
})
