const cp = require('child_process')
const log = require('./log')

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

const spawn = (cmd) => {
  const [c, ...args] = cmd.split(/\s+/)
  return cp.spawn(c, args)
}

// const execa = require('execa')
// execa.shellSync(`$SHELL -i -c ${command}`, opts)
const exec = (cmd, opts) =>
  cp.execSync(cmd, opts).toString('utf8').trim()

const blowUp = (err) => {
  if (!err) return
  log.error(err.message || err)
  // process.exit(err.code || 1)
}

module.exports = {
  blowUp,
  exec,
  find,
  relative,
  remove,
  spawn,
  swap
}
