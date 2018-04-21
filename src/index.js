#!/usr/bin/env node

const x11 = require('x11')
const Layout = require('./layout')
const u = require('./utils')
const ease = require('vec2-easing')
const isEmpty = require('zeelib/lib/is-empty').default

const spawn = u.spawn

// let X

const easeConfig = {
  easing: 20,
  frameRate: 30
}

const config = Object.assign({}, easeConfig, u.getConfig())
const term = config.terminal
// const KEYS = config.keys

// require('./xorg')(function (err, client, display) {
require('./xorg')((err, client) => {
  if (err) throw err

  let rw = client.root, _prevFocus
  let mouse = client.mouse
  let layouts = [ new Layout(rw) ]

  let l = layouts[0]

  // focus follows mouse
  mouse.change(() => {
    // eslint-disable-next-line guard-for-in
    for (let i in l.tiles) {
      let v = l.tiles[i]
      if (v && v.bounds && v.bounds.contains(mouse)) {
        if (v !== l.focused) v.focus()
      }
    }
  })

  /*
  client.client.require('randr', (Randr) => {
    Randr.SelectInput(rw.id, Randr.NotifyMask.ScreenChange)
  })
  */

  rw.on('RRScreenChangeNotify', (ev) => {
    rw.bounds.size.set(ev.width, ev.height)
    l.layout()
  })

  function cycleLayout (dir) {
    l._delay = Date.now() + l.delay
    l.hide()
    l = u.relative(layouts, l, dir || 1)
    l.show()
  }

  // create a new window, but don't add it to the tree.
  const EV = x11.eventMask.Exposure |
    x11.eventMask.SubstructureRedirect |
    x11.eventMask.MapRequest |
    x11.eventMask.SubstructureNotify |
    x11.eventMask.EnterWindow |
    x11.eventMask.KeyPress |
    x11.eventMask.KeyRelease

  rw.set({ eventMask: EV }, (err) => {
    if (err && err.error === 10) {
      console.error('Another window manager is already running.')
      process.exit(1)
    }
  })

  /*
  let pressed = []

  rw.on('KeyPress', (ev) => {
    pressed.push(ev.keycode)
    console.log(pressed)
  })

  rw.on('KeyRelease', () => {
    console.log('KeyRelease')
    if (pressed.includes(KEYS.SUPER)) {
      if (pressed.includes(KEYS.SPACE)) {
        exec('dmenu')
      } else if (pressed.includes(KEYS.RETURN)) {
        exec('xterm')
      }
    }
    pressed = []
  })
  */

  rw.children((err, children) => {
    children.forEach((win) => {
      win.kill()
      l.remove(win)
    })
    l.layout()
  })

  if (!isEmpty(config.startupPrograms)) {
    config.startupPrograms.forEach((program) => {
      try {
        spawn(program)
      } catch (_) {
        // in the future, we'll log here if config.debugLog
      }
    })
  }

  rw.on('MapRequest', (ev, win) => {
    // load the window's properties, and then lay it out.
    win.load(() => {
      // add to current layout
      let b = win.bounds
      win.bounds = ease(b, config.easing, config.frameRate)
      // eslint-disable-next-line no-proto
      win.bounds.__proto__ = b
      win.bounds.size = ease(b.size, config.easing, config.frameRate)
      // eslint-disable-next-line no-proto
      win.bounds.size.__proto__ = b.size

      win.configure({ borderWidth: config.borderWidth })
      win.on('focus', () => {
        if (_prevFocus) _prevFocus.set({ borderPixel: 0x0 })
        win.set({ borderPixel: config.borderColor })
        _prevFocus = win
        l.focused = win
      })
      win.map()
      l.add(win)
      win.focus()
      win.raise()
      l.layout()
    })
    //    win.set({eventMask: x11.eventMask.EnterWindow})
  })

  rw.on('DestroyNotify', (ev, win) => {
    l.remove(win)
  })

  rw.on('ConfigureRequest', (ev, win) => {
    // prevent windows from sizing themselves?
    if (win.bounds) win.bounds.size.set(ev.width, ev.height)
    else win.resize(ev.width, ev.height)
  })

  // open terminal
  // super-return
  // rw.onKey(0x40, 45, function (ev) {
  rw.onKey(0x40, 36, (ev) => {
    if (ev.down) spawn(term)
  })

  // super-C/I
  rw.onKey(0x40, 31, (ev) => {
    if (ev.down) spawn(process.env.BROWSER || 'chromium')
  })

  // super-Esc
  rw.onKey(0x40, 9, (ev) => {
    if (ev.down) {
      console.log('quiting...')
      process.exit(0)
    }
  })

  // super-Space
  rw.onKey(0x40, 65, (ev) => {
    if (ev.down) spawn(config.launcher)
  })

  // super-Left
  rw.onKey(0x40, 113, (ev) => {
    if (ev.down) l.cycle(-1)
  })
  rw.onKey(0x40, 114, (ev) => {
    if (ev.down) l.cycle(1)
  })

  // super-Left
  rw.onKey(0x41, 113, (ev) => {
    if (ev.down) l.move(-1)
  })

  // super-right
  rw.onKey(0x41, 114, (ev) => {
    if (ev.down) l.move(1)
  })

  rw.onKey(0x40, 111, (ev) => {
    if (ev.down) cycleLayout(1)
  })

  rw.onKey(0x40, 116, (ev) => {
    if (ev.down) cycleLayout(-1)
  })

  // Ctrl-N
  rw.onKey(0x40, 46, (ev) => {
    if (!ev.down) return
    l.hide()
    layouts.push(l = new Layout(rw))
    l.show()
  })

  function close (ev) {
    if (l.tiles.length === 0) {
      if (layouts.length === 1) {
        console.log('all windows are closed')
        process.exit(0)
      }
      return closeLayout(ev)
    }

    if (ev.down && l.focused) {
      const _focused = l.focused
      // if there are no tiles in this layout,
      // close the space.
      if (l.tiles.length > 1) l.cycle(-1)
      _focused.close()
    }
  }

  function closeLayout (ev) {
    if (!ev.down) return
    const _l = u.relative(layouts, l, -1)
    if (layouts.length <= 1) return
    l.hide()
    l.closeAll()
    if (layouts.length) u.remove(layouts, l)
    l = _l
    _l.show()
  }

  rw.onKey(0x40, 53, close) // super-Q
  rw.onKey(0x40, 59, close) // super-W
  rw.onKey(0x40, 59, closeLayout) // super-W
})
