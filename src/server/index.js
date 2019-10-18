const { createPersist } = require('stx')
const { PersistRocksDB } = require('stx-persist-rocksdb')

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
        }
      ]
    }

    const server = master.listen(7071)
    server.switchBranch = switchBranch
  })
