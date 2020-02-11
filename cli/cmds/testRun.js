const child = require('child_process')

exports.command = 'testRun'

exports.describe = 'Manually run integration'

exports.builder = {
  dir: {
    default: '.'
  }
}

exports.handler = (argv) => {
  return child.execSync(`cd ../security-events && node local.js`).toString()
}
