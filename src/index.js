const xorg = require('./xorg')
const x11 = require('x11')
const { exec } = require('./util')

const events = x11.eventMask.Button1Motion |
  x11.eventMask.ButtonPress |
  x11.eventMask.ButtonRelease |
  // x11.eventMask.SubstructureNotify |
  // x11.eventMask.SubstructureRedirect |
  // x11.eventMask.Exposure |
  x11.eventMask.KeyPress |
  x11.eventMask.KeyRelease

xorg((err, display) => {
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
        exec('dmenu_run')
      } else if (pressed.includes(RETURN)) {
        exec('x-terminal-emulator')
      }
    }
    pressed = []
  })
})
