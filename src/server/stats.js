const { createPersist } = require('stx')
const { PersistRocksDB } = require('stx-persist-rocksdb')

let stats

createPersist(
  {
    users: {},
    stories: {}
  },
  new PersistRocksDB('db/stats')
).then(statsState => {
  stats = statsState
})

const countView = (userId, storyId) => {
  const user = stats.get(['users', userId], {
    viewedCount: 0,
    readCount: 0,
    votedCount: 0,
    averageVote: 0
  })
  if (user.get(['views', storyId])) {
    return
  }
  const story = stats.get(['stories', storyId], {
    viewerCount: 0,
    readerCount: 0,
    voterCount: 0,
    totalVote: 0
  })

  stats.set({
    users: {
      [userId]: {
        viewedCount: user.get('viewedCount').compute() + 1,
        views: {
          [storyId]: {
            at: Date.now(),
            read: false,
            voted: false,
            vote: 0
          }
        }
      }
    },
    stories: {
      [storyId]: {
        viewerCount: story.get('viewerCount').compute() + 1,
        viewers: {
          [userId]: ['@', 'users', userId]
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

  stats.set({
    users: {
      [userId]: {
        readCount: user.get('readCount').compute() + 1,
        views: {
          [storyId]: {
            read: Date.now()
          }
        }
      }
    },
    stories: {
      [storyId]: {
        readerCount: story.get('readerCount').compute() + 1
      }
    }
  })
}

const countVote = (userId, storyId, newVote) => {
  const user = stats.get(['users', userId])
  const view = user.get(['views', storyId])
  if (!view) {
    return
  }

  const vote = view.get('vote').compute()
  const votedCount = user.get('votedCount').compute()
  const averageVote = user.get('averageVote').compute()

  const story = stats.get(['stories', storyId])
  const voterCount = story.get('voterCount').compute()
  const totalVote = story.get('totalVote').compute()

  let newVotedCount, newVoterCount

  if (vote === 0) {
    // add vote
    newVotedCount = votedCount + 1
    newVoterCount = voterCount + 1
  } else if (newVote === 0) {
    // remove vote
    newVotedCount = votedCount - 1
    newVoterCount = voterCount - 1
  } else {
    // update vote
    newVotedCount = votedCount
    newVoterCount = voterCount
  }

  const newAverageVote = newVotedCount
    ? (averageVote * votedCount - vote + newVote) / newVotedCount
    : 0

  const voteImpact = averageVote ? vote / averageVote : 0
  const newVoteImpact = newAverageVote ? newVote / newAverageVote : 0
  const newTotalVote = totalVote - voteImpact + newVoteImpact

  stats.set({
    users: {
      [userId]: {
        averageVote: newAverageVote,
        votedCount: newVotedCount,
        views: {
          [storyId]: {
            voted: Date.now(),
            vote: newVote
          }
        }
      }
    },
    stories: {
      [storyId]: {
        voterCount: newVoterCount,
        totalVote: newTotalVote
      }
    }
  })

  user.get('views').forEach((view, id) => {
    if (id === storyId) {
      return
    }
    const vote = view.get('vote').compute()
    if (vote === 0) {
      return
    }

    const totalVote = stats.get(['stories', id, 'totalVote'])
    totalVote.set(totalVote.compute() - vote / averageVote + vote / newAverageVote)
  })
}

const getStoryStats = id => {
  const story = stats.get(['stories', id])
  return story ? {
    viewerCount: story.get('viewerCount').compute(),
    readerCount: story.get('readerCount').compute(),
    voterCount: story.get('voterCount').compute(),
    totalVote: story.get('totalVote').compute()
  } : {
      viewerCount: 0,
      readerCount: 0,
      voterCount: 0,
      totalVote: 0
    }
}

module.exports = {
  countView,
  countRead,
  countVote,
  getStoryStats
}
