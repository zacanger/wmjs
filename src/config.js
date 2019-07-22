const getTerm = require('get-term')
const getHome = require('zeelib/lib/get-user-home').default
const utils = require('./utils')
const log = require('./log')

const keys = {
  SUPER: 133,
  SPACE: 65,
  RETURN: 36
}

const defaultConfig = {
  borderWidth: 1,
  focusFollowsMouse: true,
  keys,
  launcher: 'dmenu_run',
  log: false,
  run: utils.spawn,
  terminal: getTerm()
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
    log.debug('No user config found. Using default config.')
    return defaultConfig
  }
}

module.exports = getConfig
