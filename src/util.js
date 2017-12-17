const { execSync } = require('child_process')

const exec = (command, opts) =>
  execSync(command, ops).toString('utf8').trim()

const blowUp = (err) => {
  console.trace(err)
  process.exit(err.code || 1)
}

module.exports = {
  exec,
  blowUp
}
