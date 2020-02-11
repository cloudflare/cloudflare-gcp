const yaml = {
  read: require('read-yaml')
}

const child = require('child_process')

exports.command = 'setSchedule'

exports.describe = 'Set findings download schedule'

exports.builder = {
  dir: {
    default: '.'
  }
}

exports.handler = (argv) => {
  const { info, success, err } = require('../utils/logger')
  const { baseDir } = require('../utils/paths')
  const sh = cmd => child.execSync(cmd).toString()
  const file = yaml.read.sync(`${baseDir}/confs/setSchedule.yml`)
  try {
    sh(file.set_cron)
    sh(file.set_pubsub_subscription)
    sh(file.set_pubsub_topic)
    success(`Scheduling job created.`)
  } catch (e) {
    err(e)
  }
  info('\nClick Next -->')
}
