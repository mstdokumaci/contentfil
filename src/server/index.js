const { createPersist } = require('stx')
const { PersistRocksDB } = require('stx-persist-rocksdb')

const {
  countView,
  countRead
} = require('./stats')

const isRealUser = item => {
  const userType = item.root().get(['user', 'type'])
  return userType && userType.compute() === 'real'
}

const getUserId = item => item.root().get(['user', 'author']).serialize().pop()

const afterViewed = viewed => {
  countView(getUserId(viewed), viewed.parent().path().pop())
}

const afterRead = read => {
  countRead(getUserId(read), read.parent().path().pop())
}

createPersist(
  {
    user: {},
    route: '',
    author: {},
    draft: {},
    published: {}
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
      unPublishStory
    } = require('./story')(master)

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
          authorize: isRealUser,
          after: afterViewed
        },
        {
          path: ['published', '*', 'read'],
          authorize: isRealUser,
          after: afterRead
        }
      ]
    }

    const server = master.listen(7071)
    server.switchBranch = switchBranch
  })
