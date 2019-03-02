const home = require('zeelib/lib/get-user-home')
const { appendFile, existsSync, mkdirSync } = require('fs')
const logPath = home() + '/.local/share/wmjs'
const logFile = logPath + '/wmjs.log'

const getDateString = () => new Date().toJSON()
const level = (prefix) => (msg) => `${prefix}: ${getDateString()}: ${msg}`
const error = level('ERROR')
const warn = level('WARN')
const info = level('INFO')
const debug = level('DEBUG')

const ensureNewline = (s = '') =>
  (s + '\n').replace(/\n{2,}$/, '\n')

const getMessage = (obj = '') =>
  (obj && (obj.stack || obj.message || obj.reason)) || obj

const write = (s = '') => {
  if (!s || /: null/.test(s)) {
    return
  }
  if (!existsSync(logPath)) {
    mkdirSync(logPath)
  }
  appendFile(logFile, s, (err = '') => {
    const toWrite = getMessage(err)
    if (toWrite) {
      write(ensureNewline(toWrite))
    }
  })
}

const log = {
  error: (s = '') => {
    write(error(s))
  },
  warn: (s = '') => {
    write(warn(s))
  },
  info: (s = '') => {
    write(info(s))
  },
  debug: (s = '') => {
    write(debug(s))
  }
}

module.exports = log
