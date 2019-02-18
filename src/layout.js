const grid = require('vec2-layout/grid')

const u = require('./utils')
const bounds = (e) => e.bounds || e

const tileLayout = function () {
  grid(this.tiles.map(bounds), this.root.bounds)
}

module.exports = class Layout {
  constructor (root) {
    this.root = root
    this.all = {}
    this.tiles = []
    this.focused = null
    this.tiling = true
    this.delay = 200
  }

  add (win) {
    const self = this
    this.all[win.id] = win

    if (win.bounds && win.attrs && !win.attrs.overrideRedirect) {
      this.tiles.push(win)
      if (!this.focused) this.focused = win
      win.on('MouseOver', () => {
        if (self._delay > Date.now()) return
        if (win === self.focused) return
        self._delay = Date.now() + self.delay / 2

        self.focused = win
        win.focus()
      })
      // really, should use FocusChange here,
      // but I don't know how to distinguish between
      // getting and loosing focus.
      win.on('focus', () => {
        // if the window is mapped
        win.raise()
      })
    }
    return this
  }

  remove (win) {
    if (!win) win = this.focused
    delete this.all[win.id]
    if (win === this.focused) {
      this.focused = u.relative(this.tiles, win, -1)

      if (this.focused) this.focused.focus()
    }
    u.remove(this.tiles, win)
    // if(!this.focused)
    //  this.focused = this.tiles[0]
    this.layout()
  }

  cycle (dir) { // 1 or -1
    const f = u.relative(this.tiles, this.focused, dir || 1)
    if (f) this.focused = f.focus()
    this.layout()
    return this
  }

  move (dir) { // 1 or -1
    this._delay = Date.now() + this.delay
    if (!this.focused) this.focused = this.tiles[0].focus()
    const _focused = u.relative(this.tiles, this.focused, dir)
    u.swap(this.tiles, this.focused, _focused)
    //    focused = _focused.focus()
    this.layout()

    return this
  }

  layout () {
    tileLayout.call(this)
  }

  closeAll () {
    this.tiles.forEach((e) => {
      e.close()
    })
  }

  // hide all windows.
  hide () {
    this.tiles.forEach((e) => { e.unmap() })
  }
  // show all windows
  show () {
    this.tiles.forEach((e) => { e.map() })
  }
}
