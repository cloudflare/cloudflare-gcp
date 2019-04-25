const { red, white, green, bold, blue } = require('kleur')

module.exports.success = msg => console.log(`${green().bold(`[✔] `)}${white(msg)}`)
module.exports.info = msg => console.log(`${blue(`[cse] `)}${white(msg)}`)
module.exports.err = msg => console.log(`${red().bold(`[!] `)}${white(msg)}`)
