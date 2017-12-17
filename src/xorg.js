// taken from dominictarr's tiles wm

const x11 = require('x11')
const Rec2 = require('rec2')
const Vec2 = require('vec2')
const util = require('util')
const EventEmitter = require('events').EventEmitter
const each = require('zeelib/lib/each').default

module.exports = function (cb) {
  let X
  let all = {}

  function createWindow (wid) {
    if (all[wid]) return all[wid]
    if (wid == null) {
      // throw new Error('create window!')
      wid = X.AllocID()
      X.createWindow(wid)
    }
    return all[wid] = new Window(wid) // eslint-disable-line
  }

  util.inherits(Window, EventEmitter)

  function Window (wid, opts) {
    if (wid == null) {
      this.id = X.AllocID()
      X.CreateWindow(this.id, opts)
    }
    this.event // eslint-disable-line
    this.id = wid
    X.event_consumers[wid] = X
  }

  let w = Window.prototype
  let methods = {
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
    w[_name] = function (...args) {
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
      let b = self.bounds = new Rec2(bounds.posX, bounds.posY, bounds.width, bounds.height)
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

      if (n === 0) return n = 1, next() // eslint-disable-line

      tree.children.forEach(function (wid) {
        let w = createWindow(wid).load(function (err) {
          if (err) next(err)
          self._children.push(w)
          next()
        })
      })

      function next (err) {
        if (err) return n = -1, cb(err) // eslint-disable-line
        if (--n) return
        cb(null, self._children)
      }
    })
    return this
  }

  let kb = {}

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

  function createWindow (wid) { // eslint-disable-line
    if (wid != null && typeof wid !== 'number') throw new Error('must be number, was:' + wid)
    if (all[wid]) return all[wid]
    if (wid == null) {
      // FIX THIS
      throw new Error(`unknown window ${wid}`)
      // wid = X.AllocID()
      // X.CreateWindow(wid)
    }
    return all[wid] = new Window(wid) // eslint-disable-line
  }

  let _ev
  X = x11.createClient((err, display) => {
    if (err) return cb(err)
    const rid = display.screen[0].root

    const mouse = new Vec2(0, 0)
    mouse.change(() => {
      console.log(mouse.toJSON())
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
      // BUG IN x11? events are triggered twice!
      if (_ev === ev) return
      _ev = ev

      let wid = (ev.wid1 || ev.wid), win

      if (wid) {
        win = createWindow(wid)
      }
      if (ev.name === 'KeyPress' || ev.name === 'KeyRelease') {
        const listener = kb[ev.buttons.toString(16) + '-' + ev.keycode.toString(16)]
        ev.down = ev.name === 'KeyPress'
        ev.up = !ev.down
        if (listener) listener(ev)
      }

      if (ev.name === 'DestroyNotify') {
        delete all[ev.wid1]
      }

      if (!root) throw new Error('no root')

      if (ev.name === 'EnterWindow') {
        ev.name = 'MouseOver'
      }

      if (win) {
        win.emit(ev.name, ev)
      }
      root.emit(ev.name, ev, win)
    })
  }).on('error', (err) => {
    console.error(err.stack)
  })
}