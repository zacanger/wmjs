const xorg = require('./xorg')
const x11 = require('x11')
const exec = require('child_process').exec

xorg((err, display) => {
  display.root.set({
    eventMask: x11.eventMask.KeyPress | x11.eventMask.KeyRelease
  })

  let pressed = []

  const SUPER = 133
  const SPACE = 65
  const RETURN = 36
  display.root.on('KeyPress', (ev) => {
    pressed.push(ev.keycode)
    console.dir(ev.keycode)
  })

  display.root.on('KeyRelease', () => {
    if (pressed.includes(SUPER)) {
      if (pressed.includes(SPACE)) {
        exec('dmenu_run')
      } else if (pressed.includes(RETURN)) {
        exec('tt')
      }
    }
    pressed = []
  })
})
