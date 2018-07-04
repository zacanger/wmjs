// I want to make this into a convienent api for working with X.
// my aim to be to make it browserify where possible,
// so that your expectations from web development apply.

const EventEmitter = require('events').EventEmitter
const x11 = require('x11')
const Rec2 = require('rec2')
const Vec2 = require('vec2')
const each = require('zeelib/lib/each')

module.exports = (cb) => {
  // eslint-disable-next-line prefer-const
  let X
  const all = {}

  class Window extends EventEmitter {
    constructor (wid, opts) {
      super()
      if (wid == null) {
        this.id = X.AllocID()
        X.CreateWindow(this.id, opts)
      }
      this.id = wid
      X.event_consumers[wid] = X
    }
  }

  function createWindow (wid) {
    if (wid != null && typeof wid !== 'number') {
      throw new Error('must be number, was:' + wid)
    }

    if (all[wid]) return all[wid]
    if (wid == null) {
      // FIX THIS
      throw new Error('unknown window ' + wid)
      // wid = X.AllocID()
      // X.CreateWindow(wid)
    }
    all[wid] = new Window(wid)
    return all[wid]
  }

  const w = Window.prototype
  const methods = {
    MoveWindow: 'move',
    ResizeWindow: 'resize',
    MapWindow: 'map',
    UnmapWindow: 'unmap',
    ChangeWindowAttributes: 'set',
    QueryTree: 'tree',
    GetWindowAttributes: 'get',
    GetGeometry: 'getBounds',
    ConfigureWindow: 'configure'
  }

  each(methods, function (_name, name) {
    w[_name] = function () {
      const args = [].slice.call(arguments)
      args.unshift(this.id)
      return X[name].apply(X, args)
    }
  })

  w.load = function (cb) {
    const self = this

    this.get(function (err, attrs) {
      self.attrs = attrs
      if (self.attrs && self.bounds) cb()
    })

    this.getBounds(function (err, bounds) {
      // self.bounds = bounds
      const b = self.bounds = new Rec2(bounds.posX, bounds.posY, bounds.width, bounds.height)
      b.change(function () {
        self.move(b.x, b.y)
      })
      self.bounds.size.change(function () {
        self.resize(b.size.x, b.size.y)
      })
      if (self.attrs && self.bounds) cb()
    })
    return this
  }

  w.children = function (cb) {
    const self = this
    self._children = []
    this.tree(function (err, tree) {
      let n = tree.children.length

      if (n === 0) {
        n = 1
        return next()
      }

      tree.children.forEach((wid) => {
        const w = createWindow(wid).load((err) => {
          if (err) next(err)
          self._children.push(w)
          next()
        })
      })

      function next (err) {
        if (err) {
          n = -1
          return cb(err)
        }
        if (--n) return
        cb(null, self._children)
      }
    })
    return this
  }

  const kb = {}

  w.onKey = function (mod, key, listener) {
    kb[mod.toString('16') + '-' + key.toString(16)] = listener
    // window, parentWindow?, modifier, key, ?, async (0 = blocking)
    X.GrabKey(this.id, 0, mod, key, 0, 1)
    return this
  }

  w.offKey = function (mod, key) {
    X.GrabKey(this.id, 0, mod, key)
    return this
  }

  w.focus = function (revert) {
    X.SetInputFocus(this.id, revert || 1)
    this.emit('focus')
    return this
  }

  w.kill = function () {
    X.KillKlient(this.id)
    return this
  }

  w.close = function () {
    X.DestroyWindow(this.id)
    return this
  }

  w.raise = function () {
    X.RaiseWindow(this.id)
    return this
  }

  let _ev
  X = x11.createClient((err, display) => {
    if (err) return cb(err)
    const rid = display.screen[0].root

    const mouse = new Vec2(0, 0)
    mouse.change(function () {
      // console.log(mouse.toJSON())
    })

    setInterval(() => {
      X.QueryPointer(rid, (err, m) => {
        mouse.set(m.rootX, m.rootY)
      })
    }, 200)

    const root = createWindow(+rid).load((_err) => {
      display.root = root
      display.mouse = mouse
      cb(err, display, display)
    })

    display.createWindow = createWindow

    X.on('event', (ev) => {
      // bug in x11? events are triggered twice!
      if (_ev === ev) return
      _ev = ev

      const wid = (ev.wid1 || ev.wid)
      let win

      if (wid) win = createWindow(wid)
      if (ev.name === 'KeyPress' || ev.name === 'KeyRelease') {
        const listener = kb[ev.buttons.toString(16) + '-' + ev.keycode.toString(16)]
        ev.down = ev.name === 'KeyPress'
        ev.up = !ev.down
        if (listener) listener(ev)
      }

      if (ev.name === 'DestroyNotify') delete all[ev.wid1]

      if (!root) throw new Error('no root')

      if (ev.name === 'EnterWindow') ev.name = 'MouseOver'

      if (win) win.emit(ev.name, ev)

      root.emit(ev.name, ev, win)
    })
  }).on('error', (err) => {
    console.error(err.stack)
  })
}
