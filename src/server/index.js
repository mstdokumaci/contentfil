const { createPersist } = require('stx')
const { PersistRocksDB } = require('stx-persist-rocksdb')

const {
  countView,
  countRead,
  countVote
} = require('./stats')

const isRealUser = item => {
  const userType = item.root().get(['user', 'type'])
  return userType && userType.compute() === 'real'
}

const isRealUserAndTrue = (item, value) => {
  return isRealUser(item) && value === true
}

const isRealUserAndReadAndValidVote = (vote, value) => {
  return isRealUser(vote)
    && vote.parent().get('read').compute()
    && [0, 1, 3, 5].includes(value)
}

const getUserId = item => item.root().get(['user', 'author']).serialize().pop()

const afterViewed = viewed => {
  countView(getUserId(viewed), viewed.parent().path().pop())
}

const afterRead = read => {
  countRead(getUserId(read), read.parent().path().pop())
}

const afterVote = vote => {
  vote.parent().set({ voted: Date.now() })
  countVote(getUserId(vote), vote.parent().path().pop(), vote.compute())
}

const refreshHome = homeList => {
  homeList()
  setTimeout(refreshHome, 30 * 1000, homeList)
}

createPersist(
  {
    user: {},
    route: '',
    author: {},
    draft: {},
    published: {},
    fresh: {},
    home: {}
  },
  new PersistRocksDB('db/master')
)
  .then(master => {
    const {
      createUser,
      resendConfirmation,
      switchBranch
    } = require('./auth')(master)

    const {
      createDraft,
      deleteDraft,
      publishDraft,
      unPublishStory,
      homeList
    } = require('./story')(master)

    refreshHome(homeList)

    master.branch.newBranchMiddleware = newBranch => {
      newBranch.get('user').on('create', createUser)
      newBranch.get('user').on('resend', resendConfirmation)
      newBranch.get('draft').on('create', createDraft)
      newBranch.get('draft').on('delete', deleteDraft)
      newBranch.get('draft').on('publish', publishDraft)
      newBranch.get('draft').on('unpublish', unPublishStory)
      newBranch.branch.clientCanUpdate = [
        {
          path: ['route']
        },
        {
          path: ['draft', '*', 'content']
        },
        {
          path: ['published', '*', 'viewed'],
          authorize: isRealUserAndTrue,
          after: afterViewed
        },
        {
          path: ['published', '*', 'read'],
          authorize: isRealUserAndTrue,
          after: afterRead
        },
        {
          path: ['published', '*', 'vote'],
          authorize: isRealUserAndReadAndValidVote,
          after: afterVote
        }
      ]
    }

    const server = master.listen(7071)
    server.switchBranch = switchBranch
  })
