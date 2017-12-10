const ntk = require('ntk')
const exec = require('child_process').execSync

const blowUp = (err) => {
  console.error(err)
  process.exit(1)
}

ntk.createClient((err, app) => {
  if (err) blowUp(err)
  app.rootWindow()
    .on('configure_request', (ev) => {
      exec('tt')
    })
    .on('map_request', (ev) => {
      ev.window.map()
    })
    .on('keydown', console.dir)
    .on('mousedown', console.dir)
})
