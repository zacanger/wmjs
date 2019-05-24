#!/usr/bin/env node

const x11 = require('x11')
const Layout = require('./layout')
const u = require('./utils')
const isEmpty = require('zeelib/lib/is-empty')
const log = require('./log')
const getConfig = require('./config')

const spawn = u.spawn

// let X

// eslint-disable-next-line
let config = getConfig()
const term = config.terminal
// const KEYS = config.keys

// require('./xorg')(function (err, client, display) {
require('./xorg')((err, client) => {
  if (err) {
    log.error(err)
  }

  const rw = client.root
  let _prevFocus
  const mouse = client.mouse
  const layouts = [ new Layout(rw) ]

  let l = layouts[0]

  if (config.focusFollowsMouse) {
    // focus follows mouse
    mouse.change(() => {
      // eslint-disable-next-line guard-for-in
      for (const i in l.tiles) {
        const v = l.tiles[i]
        if (v && v.bounds && v.bounds.contains(mouse)) {
          if (v !== l.focused) v.focus()
        }
      }
    })
  }
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
      log.error('Another window manager is already running.')
      // eslint-disable-next-line no-process-exit
      process.exit(1)
    }
  })

  /*
  let pressed = []

  rw.on('KeyPress', (ev) => {
    pressed.push(ev.keycode)
    if (config.log) log.debug(pressed)
  })

  rw.on('KeyRelease', () => {
    if (config.log) log.debug('KeyRelease')
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
    if (err) {
      log.error(err)
    }
    children.forEach((win) => {
      win.kill()
      l.remove(win)
    })
    l.layout()
  })

  if (!isEmpty(config.startupPrograms)) {
    config.startupPrograms.forEach((program) => {
      try {
        const prg = spawn(program)
        prg.on('error', (err) => {
          log.error(err.message || err)
        })
      } catch (e) {
        log.error(e)
      }
    })
  }

  rw.on('MapRequest', (ev, win) => {
    // load the window's properties, and then lay it out.
    win.load(() => {
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
      if (config.log) log.debug('exiting wmjs')
      // eslint-disable-next-line no-process-exit
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

  // super-r, reload config
  /*
  rw.onKey(0x72, 113, (ev) => {
    if (ev.down) {
      config = u.getConfig()
      log.debug('Reloaded config')
    }
  })
  */

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
        if (config.log) log.debug('all windows are closed')
        // eslint-disable-next-line no-process-exit
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
