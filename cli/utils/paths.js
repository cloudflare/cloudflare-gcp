const path = require('path')
const findUp = require('find-up')

// globalDirs.npm.binaries
// findUp.sync(filename, [options])

const links = {
  get baseDir () {
    delete this.baseDir
    this.baseDir = path.join(findUp.sync('cloudflare-gcp'), 'cli')
    return this.baseDir
  },
  get deploymentDir () {
    delete this.deploymentDir
    this.deploymentDir = path.join(findUp.sync('cloudflare-gcp'), 'security-events')
    return this.deploymentDir
  },
  get envDir () {
    delete this.envDir
    this.envDir = path.join(findUp.sync('cloudflare-gcp'), 'security-events', '.env.yml')
    return this.envDir
  }
}

module.exports = links
