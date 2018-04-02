const xorg = require('./xorg')
const x11 = require('x11')
const { exec, getDefaultTerminal } = require('./util')

const dmenu = 'dmenu_run'
const term = getDefaultTerminal()

const events = x11.eventMask.Button1Motion |
  x11.eventMask.ButtonPress |
  x11.eventMask.ButtonRelease |
  // x11.eventMask.SubstructureNotify |
  // x11.eventMask.SubstructureRedirect |
  // x11.eventMask.Exposure |
  x11.eventMask.KeyPress |
  x11.eventMask.KeyRelease

xorg((err, display) => {
  // if (err) throw err
  display.root.set({
    eventMask: events
  })

  let pressed = []

  const SUPER = 133
  const SPACE = 65
  const RETURN = 36

  display.root.on('KeyPress', (ev) => {
    pressed.push(ev.keycode)
  })

  display.root.on('KeyRelease', () => {
    if (pressed.includes(SUPER)) {
      if (pressed.includes(SPACE)) {
        exec(dmenu)
      } else if (pressed.includes(RETURN)) {
        exec(term)
      }
    }
    pressed = []
  })
})
