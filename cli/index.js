#!/usr/bin/env node

exports = require('yargs')
  .commandDir('cmds')
  .demandCommand()
  .help()
  .argv

// require('env-yaml').config({ path: require('./paths').envDir })
// const path = require('path')
// const isInstalledGlobally = require('is-installed-globally')
// const findUp = require('find-up')
// const getDir = require(path.join())
// const dir = require(path.parse(require.main.filename).dir, '..')
// const getDir = require(findUp.sync('lib'))
// const cmdPath = path.resolve(findUp.sync('cmds'))
// console.log(cmdPath)

// process.env.INIT_CWD = process.cwd()

// const Liftoff = require('liftoff')
// const MyApp = new Liftoff({
//   name: 'cfse',
//   processTitle: 'cfse',
//   moduleName: 'cfse',
//   configName: 'myapp',
//   extensions: {
//     '.js': null
//   }
// })
