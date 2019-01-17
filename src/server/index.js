const { create } = require('stx')

const sMaster = create({
  route: {},
  content: '',
  draft: {
  },
  published: {
  }
})

sMaster.branch.newBranchMiddleware = newBranch => {
  newBranch.branch.clientCanUpdate = [
    {
      path: ['route']
    },
    {
      path: ['content']
    }
  ]
}

const server = sMaster.listen(7071)
server.switchBranch = (fromBranch, branchKey, switcher) => switcher(branchKey)
