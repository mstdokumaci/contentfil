const { createPersist } = require('stx')
const { PersistRocksDB } = require('stx-persist-rocksdb')

const {
  countView,
  countRead,
  countVote
} = require('./stats')

const anyTagOpen = /<\w[^>]*>/g
const anyTagClose = /<\/[^>]*>/g
const safeTagOpen = /^<(h1|h2|p|img|u|ul|ol|li|a)(( (src|href|rel)="([^"]+)")*)>$/
const safeTagClose = /^<\/(h1|h2|p|img|u|ul|ol|li|a)>$/
const unsafeAttribute = /^javascript:/

const isSafeHTML = (content, value) => {
  let openMatch = anyTagOpen.exec(value)
  while (openMatch) {
    const groups = safeTagOpen.exec(openMatch[0])
    if (
      !groups || (
        groups[5] && unsafeAttribute.test(groups[5])
      )
    ) {
      return false
    }
    openMatch = anyTagOpen.exec(value)
  }

  let closeMatch = anyTagClose.exec(value)
  while (closeMatch) {
    if (!safeTagClose.test(closeMatch[0])) {
      return false
    }
    closeMatch = anyTagClose.exec(value)
  }

  return true
}

const isRealUser = item => {
  const userType = item.root().get(['user', 'type'])
  return userType && userType.compute() === 'real'
}

const isRealUserAndTrue = (item, value) => {
  return isRealUser(item) && value === true
}

const isRealUserAndNotOwnStoryAndReadAndValidVote = (vote, value) => {
  return isRealUser(vote)
    && vote.root().get(['user', 'author']).serialize().pop() !== vote.parent().get('author').serialize().pop()
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
      homeList
    } = require('./story')(master)

    const {
      getStories
    } = require('./stats')

    setTimeout(refreshHome, 5 * 1000, homeList)

    master.branch.newBranchMiddleware = newBranch => {
      const user = newBranch.get('user')
      user.on('create', createUser)
      user.on('resend', resendConfirmation)

      const draft = newBranch.get('draft')
      draft.on('create', createDraft)
      draft.on('delete', deleteDraft)
      draft.on('publish', publishDraft)

      newBranch.branch.clientCanUpdate = [
        {
          path: ['route']
        },
        {
          path: ['draft', '*', 'content'],
          authorize: isSafeHTML
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
          authorize: isRealUserAndNotOwnStoryAndReadAndValidVote,
          after: afterVote
        }
      ]

      let authorSubscription, storiesSubscription
      user.on('login', () => {
        if (authorSubscription) {
          return
        }

        authorSubscription = user.get('author').origin().subscribe({ keys: ['published'], depth: 2 }, author => {
          const published = author.get('published')
          if (!published) {
            return
          }

          const ids = published.map((_, id) => id)
          if (storiesSubscription) {
            storiesSubscription.unsubscribe()
          }
          storiesSubscription = getStories().subscribe({ keys: ids }, stories => {
            const setJSON = ids.reduce((obj, id) => {
              const story = stories.get(id)
              if (story) {
                const { viewerCount, readerCount, voterCount, totalVote } = story.serialize()
                obj[id] = { viewerCount, readerCount, voterCount, totalVote }
              }
              return obj
            }, {})
            published.set(setJSON)
          })
        })
      })
    }

    const server = master.listen(7071)
    server.switchBranch = switchBranch
  })
