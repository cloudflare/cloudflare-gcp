const { red, white, green, bold, blue } = require('kleur')

module.exports.success = async (msg, isResponse) => console.log(`${green().bold(`[✔] `)}${white(msg)}`)
module.exports.info = async msg => console.log(`${blue(`[cse] `)}${white(msg)}`)
module.exports.err = async msg => console.log(`${red().bold(`[!] `)}${white(msg)}`)
