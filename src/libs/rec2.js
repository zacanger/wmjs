const Vec2 = require('./vec2')
const inherits = require('util').inherits

inherits(Rec2, Vec2)

module.exports = Rec2

function Rec2 (x, y, w, h) {
  if (!(this instanceof Rec2)) {
    return new Rec2(x, y, w, h)
  }
  x = x || 0
  y = y || 0
  w = w || 0
  h = h || 0
  this.set(x, y)
  const self = this
  const size = this.size = new Vec2(w, h)
  const bound = this.bound = new Vec2(x + w, y + h)
  let UPDATE = true
  size.change((x, y) => {
    if (!UPDATE) return
    if (x < 0 || y < 0) {
      throw new Error('size must be positive')
    }
    UPDATE = false
    bound.set(self.x + size.x, self.y + size.y)
    UPDATE = true
  })
  bound.change(() => {
    if (!UPDATE) return
    UPDATE = false
    size.set(bound.x - self.x, bound.y - self.y)
    UPDATE = true
  })
  this.change(() => {
    bound.set(self.x + self.size.x, self.y + self.size.y)
  })
}

const R = Rec2.prototype

R.contains = (point) =>
  this.x <= point.x &&
    point.x <= this.bound.x &&
    this.y <= point.y &&
    point.y <= this.bound.y

R.collides = (box) => (
  ((this.x <= box.x &&
    box.x <= this.bound.x) ||
    (this.x <= box.bound.x &&
    box.bound.x <= this.bound.x)) &&
  ((this.y <= box.y &&
    box.y <= this.bound.y) ||
    (this.y <= box.bound.y &&
    box.bound.y <= this.bound.y)))

R.area = () => this.size.x * this.size.y
