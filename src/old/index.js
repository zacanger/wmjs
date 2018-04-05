const xorg = require('./xorg')
const x11 = require('x11')
const { getConfig, exec, getDefaultTerminal, blowUp } = require('./util')

const dmenu = 'dmenu_run'
const term = getDefaultTerminal()

const config = getConfig()
const KEYS = config.keys

const events = x11.eventMask.Button1Motion |
  x11.eventMask.ButtonPress |
  x11.eventMask.ButtonRelease |
  // x11.eventMask.SubstructureNotify |
  // x11.eventMask.SubstructureRedirect |
  // x11.eventMask.Exposure |
  x11.eventMask.KeyPress |
  x11.eventMask.KeyRelease

xorg((err, display) => {
  blowUp(err)
  display.root.set({
    eventMask: events
  })

  let pressed = []

  display.root.on('KeyPress', (ev) => {
    pressed.push(ev.keycode)
  })

  display.root.on('KeyRelease', () => {
    if (pressed.includes(KEYS.SUPER)) {
      if (pressed.includes(KEYS.SPACE)) {
        exec(dmenu)
      } else if (pressed.includes(KEYS.RETURN)) {
        exec(term)
      }
    }
    pressed = []
  })
})
