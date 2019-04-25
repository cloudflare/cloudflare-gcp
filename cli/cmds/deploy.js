const shP = require('exec-sh').promise
const yaml = {
  read: require('read-yaml')
}

exports.command = 'deploy'

exports.describe = 'Deploy Cloud Functions'

exports.builder = {
  dir: {
    default: '.'
  }
}

exports.handler = async function deploy (argv) {
  const { info, success, err } = require('../utils/logger')
  const { baseDir, deploymentDir } = require('../utils/paths')
  console.log(argv.dir)
  let cmds = yaml.read.sync(`dist/functions.yml`).funcs
  if (process.env.BQ_DATASET !== 'cflogs_table.recent_events') delete cmds.gcsbq

  const runCmds = [cmds].map(async cmd => {
    let [funcName, funcValue] = [Object.keys(cmd)[0], Object.values(cmd)[0]]
    let out
    try {
      out = await shP(`cd ${deploymentDir} && ${funcValue}`, false)
      success(`Function ${funcName} succeeded`)
    } catch (e) {
      out = err(e)
    }
    return out
  })

  for (const cmd of runCmds) {
    await cmd
  }
}
