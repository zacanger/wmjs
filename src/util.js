const id = require('zeelib/lib/id').default
const exit = require('zeelib/lib/exit').default
const { execSync } = require('child_process')
const { env } = process

// this is sorted in what i think is a good order by preference.
// everyone probably has xterm and maybe rxvt, but may have
// something else they prefer.
// so first we check env vars, then scripts/programs that run defaults,
// then fancy terms people might like, then the standard programs.
const terms = [
  // env vars
  env.TERM,
  env.TERMINAL,
  // programs that run whatever you've set
  'x-terminal-emulator',
  'terminal',

  // fancy terminals
  'alacritty',
  'eterm',
  'gnome-terminal',
  'hyper',
  'kitty',
  'konsole',
  'lilyterm',
  'lxterminal',
  'mrxvt',
  'quake',
  'roxterm',
  'sakura',
  'terminator',
  'terminology',
  'termite',
  'tilda',
  'xfce4-terminal',
  'yakuake',

  // not exactly fancy...
  'stterm', // debian
  'st', // not-debian -- might conflict with the st server package...

  // defaults
  'urxvt',
  'rxvt',
  'xterm'
].filter(id)

const exec = (command, opts) =>
  execSync(command, opts).toString('utf8').trim()

const blowUp = (err) => {
  if (!err) return
  console.trace(err)
  // exit(err.code || 1)
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
