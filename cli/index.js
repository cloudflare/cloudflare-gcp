#!/usr/bin/env node

exports = require('yargs')
  .commandDir('cmds')
  .demandCommand()
  .help()
  .argv
