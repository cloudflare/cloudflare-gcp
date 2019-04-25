const path = require('path')
const findUp = require('find-up')
const globalDirs = require('global-dirs')

console.log(globalDirs.npm.prefix)
// globalDirs.npm.binaries
// findUp.sync(filename, [options])

const links = {
  get baseDir () {
    delete this.baseDir
    this.baseDir = path.join(findUp.sync('utils'), '..')
    return this.baseDir
  },
  get deploymentDir () {
    delete this.deploymentDir
    this.deploymentDir = path.join(findUp.sync('utils'), '..', '..', 'security-events')
    return this.deploymentDir
  },
  get envDir () {
    delete this.envDir
    this.envDir = path.join(findUp.sync('utils'), '..', '..', 'security-events', '.env.yml')
    return this.envDir
  }
}

console.log(links.deploymentDir, links.baseDir, links.envDir)

module.exports = links
