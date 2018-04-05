const cp = require('child_process')
const { env } = process
// const exit = require('zeelib/lib/exit').default
const id = require('zeelib/lib/id').default
const getHome = require('zeelib/lib/get-user-home').default

const spawn = (cmd) => {
  let args = cmd.split(/\s+/)
  cmd = args.shift()
  cp.spawn(cmd, args)
}

// const execa = require('execa')
// execa.shellSync(`$SHELL -i -c ${command}`, opts)

const exec = (cmd, opts) =>
  cp.execSync(cmd, opts).toString('utf8').trim()

// this is sorted in what i think is a good order by preference.
// everyone probably has xterm and maybe rxvt, but may have
// something else they prefer.
// so first we check env vars, then scripts/programs that run defaults,
// then fancy terms people might like, then the standard programs.
const terms = [
  // env vars
  // env.TERM,
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
  keys
}

const getConfig = () => {
  const path = getHome() + '/config/wmjs'
  try {
    return require(path)(defaultConfig)
  } catch (_) {
    return defaultConfig
  }
}

function each (obj, iter) {
  for (let k in obj) iter(obj[k], k, obj)
}

function remove (array, item) {
  let i = array.indexOf(item)
  if (~i) array.splice(i, 1)
}

function find (ary, test) {
  for (let i in ary) {
    if (test(ary[i], i, ary)) return ary[i]
  }
}

function swap (ary, a, b) {
  let i = ary.indexOf(a)
  let j = ary.indexOf(b)
  // if the window is the first or last, do not swap,
  // instead shift/pop so that overall order is preserved.

  if (i === 0 && j === ary.length - 1) {
    ary.push(ary.shift())
  } else if (j === 0 && i === ary.length - 1) {
    ary.unshift(ary.pop())
  } else {
    ary[i] = b
    ary[j] = a
  }
  return ary
}


function relative (ary, item, dir) {
  let i = ary.indexOf(item)
  if (~i) {
    i = i + dir
    if (i < 0) i = ary.length + i
    if (i >= ary.length) i = i - ary.length
    const w = ary[i]
    return w
  }
}

module.exports = {
  blowUp,
  each,
  exec,
  find,
  getConfig,
  getDefaultTerminal,
  isInstalled,
  relative,
  remove,
  spawn,
  swap
}
