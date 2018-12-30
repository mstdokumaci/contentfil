const { create } = require('stx')

const sMaster = create({
  route: {},
  content: ''
})

const updateRoute = (val, _, item) => {
  item.set([ '@', 'content', val ])
}

const toggleFavourite = (val, _, item) => {
  const favourite = item.get([ val, 'favourite'], false)
  favourite.set(!favourite.compute())
}

const updateContent = (val, _, item) => item.set(val)

sMaster.branch.branchListeners = branch => {
  branch.get('route').on('update', updateRoute)
  branch.get('content').on('toggleFavourite', toggleFavourite)
  branch.get('content').on('update', updateContent)
}

const server = sMaster.listen(7071)
server.switchBranch = (fromBranch, branchKey, switcher) => switcher(branchKey)
