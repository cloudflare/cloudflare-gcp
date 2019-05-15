/**
 *
 *
 *
 *
 * Retrieve service account key with sufficient permissions to use SCC integration
 *
 *
 *
 */

const yaml = {
  read: require('read-yaml')
}
const child = require('child_process')

exports.command = 'getServiceAcctKey'

exports.describe = 'Retrieve new service account key'

exports.builder = {
  dir: {
    default: '.'
  }
}

exports.handler = (argv) => {
  const { info, success, err } = require('../utils/logger')
  const { baseDir } = require('../utils/paths')
  const sh = cmd => child.execSync(cmd).toString()
  const file = yaml.read.sync(`dist/service.yml`)

  if (argv.create) sh(file.create)

  for (let i = 0; i < file.add_binding.organization.roles.length; i++) {
    try {
      let iamBinding = (file.add_binding.organization.cmd[0]).replace('ROLE_ID', file.add_binding.organization.roles[i])
      sh(iamBinding)
      success(file.add_binding.organization.roles[i])
    } catch (e) {
      err(e)
    }
  }

  sh(file.download_key)
  // sh(file.activate)
  info('\nClick Next -->')
}
