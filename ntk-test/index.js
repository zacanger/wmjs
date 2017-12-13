const ntk = require('ntk')
const exec = require('child_process').execSync

const dir = (o) => console.dir(o, { colors: true })

const blowUp = (err) => {
  console.error(err)
  process.exit(1)
}

ntk.createClient((err, app) => {
  if (err) blowUp(err)
  // lol this
  try {
    exec('dmenu_run')
  } catch (_) {
    try {
      exec('x-terminal-emulator')
    } catch (_) {
      exec('xterm')
    }
  }
  const wm = app.rootWindow()
  wm.on('configure_request', (ev) => { // eslint-disable-line no-unused-vars
    // ?
  })
  wm.on('map_request', (ev) => {
    ev.window.map()
  })
  wm.on('keydown', dir)
  wm.on('mousedown', dir)
  wm.on('mousemove', dir)
  wm.map()
})
