const yaml = {
  read: require('read-yaml')
}
const child = require('child_process')
const { info, success, err } = require('../utils/logger')
const { baseDir, deploymentDir, envDir } = require('../utils/paths')
require('env-yaml').config({ path: envDir })

exports.command = 'deploy'

exports.describe = 'Deploy Cloud Functions'

exports.builder = {
  dir: {
    default: '.'
  }
}

exports.handler = async function deploy (argv) {
  const sh = cmd => child.execSync(cmd).toString()
  let file = yaml.read.sync(`${baseDir}/confs/deploy.yml`)
  console.log(file.create_bucket)
  try {
    sh(file.create_bucket.main)
    success(`Bucket created. Starting function deployment`)
  } catch (e) {
    info(`Bucket already created. Starting function deployment`)
  } finally {
    let cmdString = ''
    for (let [k, v] of Object.entries(file.deploy_function)) {
      cmdString += ` --${k}=${v}`
    }
    cmdString = 'gcloud beta functions deploy FirewallEventsToSecurityCenter' + cmdString
    cmdString = cmdString.trimRight().trimLeft()
    sh(cmdString)
  }
}
