const getTerm = require('get-term')
const isInstalled = require('is-program-installed')
const cp = require('child_process')
const log = require('./log')
// const exit = require('zeelib/lib/exit')
const getHome = require('zeelib/lib/get-user-home')

const spawn = (cmd) => {
  const args = cmd.split(/\s+/)
  cmd = args.shift()
  return cp.spawn(cmd, args)
}

// const execa = require('execa')
// execa.shellSync(`$SHELL -i -c ${command}`, opts)

const exec = (cmd, opts) =>
  cp.execSync(cmd, opts).toString('utf8').trim()

const blowUp = (err) => {
  if (!err) return
  log.error(err.message || err)
  // exit(err.code || 1)
}

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
  terminal: getTerm(),
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
