#!/usr/bin/env node

if (module.parent) {
  console.error('Please install wmjs globally')
  process.exit(1)
}

const x11 = require('x11')
const exec = require('child_process').execSync

const MOD_1_MASK = 1 << 3 // TODO: This won't be true for everyone
const KEYSYM_F1 = 67
const GRAB_MODE_ASYNC = 1
const NONE = 0

let start
let attr
let X

x11.createClient((error, display) => {
  X = global.X = display.client

  X.GrabKey(
    display.screen[0].root,
    true,
    MOD_1_MASK,
    KEYSYM_F1,
    GRAB_MODE_ASYNC,
    GRAB_MODE_ASYNC
  )

  X.GrabButton(
    display.screen[0].root,
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
    display.screen[0].root,
    true,
    x11.eventMask.ButtonPress | x11.eventMask.ButtonRelease | x11.eventMask.PointerMotion,
    GRAB_MODE_ASYNC,
    GRAB_MODE_ASYNC,
    NONE,
    NONE,
    3,
    MOD_1_MASK
  )

  try {
    exec('x-terminal-emulator')
  } catch (_) {
    // we tried.
    exec('xterm')
  }
}).on('event', (event) => {
  if (event.name === 'KeyPress' && event.child !== 0) {
    X.RaiseWindow(event.child)
  } else if (event.name === 'ButtonPress' && event.child !== 0) {
    X.GetGeometry(event.child, (error, attributes) => {
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
