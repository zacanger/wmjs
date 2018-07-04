const cp = require('child_process')
// const exit = require('zeelib/lib/exit')
const id = require('zeelib/lib/id')
const getHome = require('zeelib/lib/get-user-home')

const spawn = (cmd) => {
  const args = cmd.split(/\s+/)
  cmd = args.shift()
  cp.spawn(cmd, args)
}

// const execa = require('execa')
// execa.shellSync(`$SHELL -i -c ${command}`, opts)

const exec = (cmd, opts) =>
  cp.execSync(cmd, opts).toString('utf8').trim()

const terms = [
  process.env.TERMINAL,
  'x-terminal-emulator', // debian
  'terminal', // arch, i think?

  // fancy terminals
  'Eterm',
  'alacritty',
  'aterm',
  'eterm',
  'gnome-terminal',
  'guake',
  'hyper',
  'kitty',
  'konsole',
  'lilyterm',
  'lxterminal',
  'mate-terminal',
  'mrxvt',
  'qterminal',
  'roxterm',
  'sakura',
  'terminator',
  'terminix',
  'terminology',
  'termit',
  'termite',
  'tilda',
  'tilix',
  'xfce4-terminal',
  'yakuake',

  // less fancy terminals
  'stterm', // debian
  'st', // not-debian -- might conflict with the st server package...

  // defaults
  'urxvt',
  'uxterm',
  'rxvt',
  'xterm'
].filter(id)

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

const keys = {
  SUPER: 133,
  SPACE: 65,
  RETURN: 36
}

const defaultConfig = {
  run: spawn,
  keys,
  borderWidth: 1,
  launcher: 'dmenu_run',
  terminal: getDefaultTerminal(),
  focusFollowsMouse: true
}

const stringToHex = (s = 'FFFFFF') =>
  Number('0x' + s.replace('#', ''))

const getConfig = () => {
  const path = getHome() + '/.config/wmjs'
  try {
    const userConfig = require(path)(defaultConfig)
    userConfig.borderColor = stringToHex(userConfig.borderColor)
    return Object.assign({}, defaultConfig, userConfig)
  } catch (_) {
    // in the future, log here if config.debugLog
    return defaultConfig
  }
}

const remove = (xs, item) => {
  const i = xs.indexOf(item)
  if (~i) xs.splice(i, 1)
}

const find = (xs, test) => {
  for (const i in xs) {
    if (test(xs[i], i, xs)) {
      return xs[i]
    }
  }
}

const swap = (xs, a, b) => {
  const i = xs.indexOf(a)
  const j = xs.indexOf(b)
  // if the window is the first or last, do not swap,
  // instead shift/pop so that overall order is preserved.

  if (i === 0 && j === xs.length - 1) {
    xs.push(xs.shift())
  } else if (j === 0 && i === xs.length - 1) {
    xs.unshift(xs.pop())
  } else {
    xs[i] = b
    xs[j] = a
  }
  return xs
}

const relative = (xs, item, dir) => {
  let i = xs.indexOf(item)
  if (~i) {
    i += dir
    if (i < 0) i = xs.length + i
    if (i >= xs.length) i -= xs.length
    const w = xs[i]
    return w
  }
}

module.exports = {
  blowUp,
  exec,
  find,
  getConfig,
  isInstalled,
  relative,
  remove,
  spawn,
  swap
}
