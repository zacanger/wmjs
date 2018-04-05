const grid = require('vec2-layout/grid')

const u = require('./utils')
const bounds = (e) => e.bounds || e
const tileLayout = function () {
  grid(this.tiles.map(bounds), this.root.bounds)
}

module.exports = Layout

function Layout (root) {
  this.root = root
  this.all = {}
  this.tiles = []
  this.focused
  this.tiling = true
  this.delay = 200
  this.layouts = [tileLayout]
}

const l = Layout.prototype

l.add = function (win) {
  let self = this
  this.all[win.id] = win

  if (win.bounds && win.attrs && !win.attrs.overrideRedirect) {
    this.tiles.push(win)
    if (!this.focused) this.focused = win
    win.on('MouseOver', function () {
      if (self._delay > Date.now()) return
      if (win === self.focused) return
      self._delay = Date.now() + self.delay / 2

      self.focused = win
      win.focus()
    })
    // really, should use FocusChange here,
    // but I don't know how to distinguish between
    // getting and loosing focus.
    win.on('focus', function (ev) {
      // if the window is mapped
      win.raise()
    })
  }
  return this
}

l.remove = function (win) {
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

l.cycle = function (dir) { // 1 or -1
  let f = u.relative(this.tiles, this.focused, dir || 1)
  if (f) this.focused = f.focus()
  this.layout()
  return this
}

l.move = function (dir) { // 1 or -1
  this._delay = Date.now() + this.delay
  if (!this.focused) this.focused = this.tiles[0].focus()
  let _focused = u.relative(this.tiles, this.focused, dir)
  u.swap(this.tiles, this.focused, _focused)
  //    focused = _focused.focus()
  this.layout()

  return this
}

l.layout = function () {
  this.layouts[0].call(this)
}

l.closeAll = function () {
  this.tiles.forEach(function (e) {
    e.close()
  })
}

// hide all windows.
l.hide = function () {
  this.tiles.forEach(function (e) { e.unmap() })
}
// show all windows
l.show = function () {
  this.tiles.forEach(function (e) { e.map() })
}
