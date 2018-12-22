const { create } = require('stx')

const sMaster = create()

const updateRoute = (val, _, item) => {
  item.set([ '@', 'content', val ])
}

const toggleFavourite = (val, _, item) => {
  const favourite = item.get([ val, 'favourite'], false)
  favourite.set(!favourite.compute())
}

sMaster.branch.branchListeners = branch => {
  branch.get('route').on('update', updateRoute)
  branch.get('content').on('toggleFavourite', toggleFavourite)
}

const server = sMaster.listen(7071)
server.switchBranch = (fromBranch, branchKey, switcher) => switcher(branchKey)
