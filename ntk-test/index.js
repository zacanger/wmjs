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
  app.rootWindow()
    .on('configure_request', (ev) => {
      // ?
    })
    .on('map_request', (ev) => {
      ev.window.map()
    })
    .on('keydown', dir)
    .on('mousedown', dir)
})
