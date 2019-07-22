const EventEmitter = require('events').EventEmitter
const x11 = require('x11')
const Rec2 = require('./libs/rec2')
const Vec2 = require('./libs/vec2')
const log = require('./log')

module.exports = (cb) => {
  // eslint-disable-next-line prefer-const
  let X
  const all = {}
  const kb = {}

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

    load (cb) {
      const self = this

      this.get(function (err, attrs) {
        if (err) {
          log.error(err)
        }

        self.attrs = attrs
        if (self.attrs && self.bounds) cb()
      })

      this.getBounds(function (err, bounds) {
        if (err) {
          log.error(err)
        }

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

    children (cb) {
      const self = this
      self._children = []
      this.tree(function (err, tree) {
        if (err) {
          log.error(err)
        }

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

    onKey (mod, key, listener) {
      kb[mod.toString('16') + '-' + key.toString(16)] = listener
      // window, parentWindow?, modifier, key, ?, async (0 = blocking)
      X.GrabKey(this.id, 0, mod, key, 0, 1)
      return this
    }

    offKey (mod, key) {
      X.GrabKey(this.id, 0, mod, key)
      return this
    }

    focus (revert) {
      X.SetInputFocus(this.id, revert || 1)
      this.emit('focus')
      return this
    }

    kill () {
      X.KillKlient(this.id)
      return this
    }

    close () {
      X.DestroyWindow(this.id)
      return this
    }

    raise () {
      X.RaiseWindow(this.id)
      return this
    }
  }

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

  Object.keys(methods).forEach((m) => {
    Window.prototype[methods[m]] = function (...args) {
      args.unshift(this.id)
      return X[m].apply(X, args)
    }
  })

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

  let _ev
  X = x11.createClient((err, display) => {
    if (err) return cb(err)
    const rid = display.screen[0].root

    const mouse = new Vec2(0, 0)
    // mouse.change(() => { // console.log(mouse.toJSON()) })

    // testing new keybinding code
    const min = display.min_keycode
    const max = display.max_keycode
    const chr2Data = []
    const key2Data = []
    // The keySyms is a hash of mnemonic char names, associated to an integer
    // charcode and its description.
    for (const codeName in x11.keySyms) {
      const keyData = x11.keySyms[codeName]
      chr2Data[keyData.code] = { codeName: codeName, description: keyData.description }
    }
    // Get the local key mapping to build key2Data.
    display.client.GetKeyboardMapping(min, max - min, (err, list) => {
      if (err) {
        log.error(err)
      }
      for (let i = 0; i < list.length; ++i) {
        const name = key2Data[i + min] = []
        const sublist = list[i]
        for (let j = 0; j < sublist.length; ++j) {
          name.push(chr2Data[sublist[j]])
        }
      }
    })

    setInterval(() => {
      X.QueryPointer(rid, (err, m) => {
        if (err) {
          log.error(err)
        }
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
      const win = wid ? createWindow(wid) : undefined

      if (ev.name === 'KeyPress' || ev.name === 'KeyRelease') {
        // TESTING
        // console.log(key2Data[ev.keycode])
        const listener = kb[ev.buttons.toString(16) + '-' + ev.keycode.toString(16)]
        ev.down = ev.name === 'KeyPress'
        ev.up = !ev.down
        // console.log(ev)
        if (listener) listener(ev)
      }

      if (ev.name === 'DestroyNotify') {
        delete all[ev.wid1]
      }

      if (!root) {
        throw new Error('no root')
      }

      if (ev.name === 'EnterWindow') {
        ev.name = 'MouseOver'
      }

      if (win) {
        win.emit(ev.name, ev)
      }

      root.emit(ev.name, ev, win)
    })
  }).on('error', (err) => {
    log.error(err.stack || err)
  })
}
