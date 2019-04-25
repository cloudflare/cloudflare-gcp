const child = require('child_process')

exports.command = 'account'

exports.describe = 'Get or set current Google account configuration'

exports.builder = {
  dir: {
    default: '.'
  }
}

exports.handler = (argv) => {
  if (argv.set) return child.execSync(`gcloud config set account ${argv.set}`).toString()
  return child.execSync(`gcloud config get-value account --format=object`).toString()
}
