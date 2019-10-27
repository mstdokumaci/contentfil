const { createPersist } = require('stx')
const { PersistRocksDB } = require('stx-persist-rocksdb')

let stats

createPersist(
  {
    users: {

    },
    stories: {

    }
  },
  new PersistRocksDB('db/stats')
).then(statsState => {
  stats = statsState
})

const countView = (userId, storyId) => {
  const user = stats.get(['users', userId], {
    viewedCount: 0,
    readCount: 0
  })
  if (user.get(['views', storyId])) {
    return
  }
  const story = stats.get(['stories', storyId], {
    viewerCount: 0,
    readerCount: 0
  })
  const time = Date.now()

  stats.set({
    users: {
      [userId]: {
        viewedCount: user.get('viewedCount').compute() + 1,
        views: {
          [storyId]: {
            at: time,
            read: false
          }
        }
      }
    },
    stories: {
      [storyId]: {
        viewerCount: story.get('viewerCount').compute() + 1,
        viewers: {
          [userId]: {
            at: time,
            read: false
          }
        }
      }
    }
  })
}

const countRead = (userId, storyId) => {
  const user = stats.get(['users', userId])
  if (!user.get(['views', storyId])) {
    return
  }
  const story = stats.get(['stories', storyId])
  const time = Date.now()

  stats.set({
    users: {
      [userId]: {
        readCount: user.get('readCount').compute() + 1,
        views: {
          [storyId]: {
            read: time
          }
        }
      }
    },
    stories: {
      [storyId]: {
        readerCount: story.get('readerCount').compute() + 1,
        viewers: {
          [userId]: {
            read: time
          }
        }
      }
    }
  })
}

module.exports = {
  countView,
  countRead
}
