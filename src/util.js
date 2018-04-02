const id = require('zeelib/lib/id').default
const { execSync } = require('child_process')
const { env } = process
const terms = [
  env.TERM || env.TERMINAL,
  'x-terminal-emulator',
  'urxvt',
  'rxvt',
  'xterm'
].filter(id)

const exec = (command, opts) =>
  execSync(command, opts).toString('utf8').trim()

const blowUp = (err) => {
  console.trace(err)
  process.exit(err.code || 1)
}

const isInstalled = (program) => {
  try {
    exec(`hash ${program} 2>/dev/null`)
    return true
  } catch (_) {
    return false
  }
}

const getDefaultTerminal = () =>
  terms[terms.map(isInstalled).findIndex(id)]

module.exports = {
  exec,
  blowUp,
  isInstalled,
  getDefaultTerminal
}
