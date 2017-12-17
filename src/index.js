// this is basically just node-tinywm, cleaned up

const x11 = require('x11')
const exec = require('child_process').execSync
const EventEmitter = require('events').EventEmitter
const dir = (o) => console.dir(o, { colors: true })
const keyboard = require('x11-keyboard')

const util = require('./util')

const MOD_1_MASK = 1 << 3 // TODO: This won't be true for everyone
const KEYSYM_F1 = 67
const GRAB_MODE_ASYNC = 1
const NONE = 0

let start
let attr
let X

keyboard.on('key.down:ctrl+enter', console.dir)

x11.createClient((err, display) => {
  if (err) util.blowUp(err)
  X = global.X = display.client

  const root = display.screen[0].root

  X.GrabKey(
    root,
    true,
    MOD_1_MASK,
    KEYSYM_F1,
    GRAB_MODE_ASYNC,
    GRAB_MODE_ASYNC
  )

  X.GrabButton(
    root,
    true,
    x11.eventMask.ButtonPress | x11.eventMask.ButtonRelease | x11.eventMask.PointerMotion,
    GRAB_MODE_ASYNC,
    GRAB_MODE_ASYNC,
    NONE,
    NONE,
    1,
    MOD_1_MASK
  )

  X.GrabButton(
    root,
    true,
    x11.eventMask.ButtonPress | x11.eventMask.ButtonRelease | x11.eventMask.PointerMotion,
    GRAB_MODE_ASYNC,
    GRAB_MODE_ASYNC,
    NONE,
    NONE,
    3,
    MOD_1_MASK
  )

  const fid = X.AllocID()
  X.ChangeWindowAttributes(root, { eventMask: x11.eventMask.KeyPress })

  X.CreateWindow(fid, root, -9, -9, 1, 1)

  /*
  try {
    exec('x-terminal-emulator')
  } catch (_) {
    // we tried.
    exec('xterm')
  }
  */
  exec('stterm')

  let winX = parseInt(Math.random() * 300, 10)
  let winY = parseInt(Math.random() * 300, 10)
  const ee = new EventEmitter()
  X.event_consumers[fid] = ee
  let dragStart = null
  ee.on('event', (evt) => {
    console.log(94, evt)
    dir(evt)
    if (evt.type === 17) {
      X.DestroyWindow(fid)
    } else if (evt.type === 4) {
      dragStart = { rootx: evt.rootx, rooty: evt.rooty, x: evt.x, y: evt.y, winX: winX, winY: winY }
    } else if (evt.type === 5) {
      dragStart = null
    } else if (evt.type === 6) {
      winX = dragStart.winX + evt.rootx - dragStart.rootx
      winY = dragStart.winY + evt.rooty - dragStart.rooty
      X.MoveWindow(fid, winX, winY)
    } /* else if (evt.type === 12) {
      X.Render.Composite(3, bggrad, 0, framepic, 0, 0, 0, 0, 0, 0, width, height)
    } */
  })
})
  .on('error', util.blowUp)
  .on('event', (event) => {
    dir(event)
    if (event.name === 'KeyPress' && (event.xkey.keycode || event.keycode)) {
      console.log(94, event)
      const k = event.xkey.keycode || event.keycode
      if (k === 133) exec('dmenu_run')
    } else if (event.name === 'KeyPress' && event.child !== 0) {
      X.RaiseWindow(event.child)
    } else if (event.name === 'ButtonPress' && event.child !== 0) {
      X.GetGeometry(event.child, (err, attributes) => {
        if (err) util.blowUp(err)
        start = event
        attr = attributes
      })
    } else if (event.name === 'MotionNotify' && typeof start !== 'undefined' && start.child !== 0) {
      const xdiff = event.rootx - start.rootx
      const ydiff = event.rooty - start.rooty
      X.MoveResizeWindow(
        start.child,
        attr.xPos + (start.keycode === 1 ? xdiff : 0),
        attr.yPos + (start.keycode === 1 ? ydiff : 0),
        Math.max(1, attr.width + (start.keycode === 3 ? xdiff : 0)),
        Math.max(1, attr.height + (start.keycode === 3 ? ydiff : 0))
      )
    } else if (event.name === 'ButtonRelease') {
      start = undefined
    }
  })
