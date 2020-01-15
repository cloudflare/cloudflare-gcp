const shP = require('exec-sh').promise
const yaml = {
  read: require('read-yaml')
}

exports.command = 'enableAPIs'

exports.describe = 'Enable APIs'

exports.builder = {
  dir: {
    default: '.'
  }
}

exports.handler = async function enableAPIs () {
  const { info, success, err } = require('../utils/logger')
  const { baseDir } = require('../utils/paths')
  let cmds = yaml.read.sync(`${baseDir}/dist/enableAPIs.yml`)
  cmds = Object.values(cmds.apis)
  let i = 1
  const runCmds = cmds.map(async cmd => {
    let out
    try {
      out = await shP(`${cmd}`, false)
    } catch (e) {
      if (e instanceof TypeError) err(e)
    }
    return out
  })

  for (const cmd of runCmds) {
    await cmd
    success(`${i++}/${cmds.length} .. ${cmds[i - 2]} succeeded`)
    if (i === runCmds.length) {
      setTimeout(() => { info('\nClick Next -->') }, 2000)
    }
  }
}
