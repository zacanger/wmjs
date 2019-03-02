const Vec2 = require('./vec2')

class Rec2 extends Vec2 {
  constructor (x, y, w, h) {
    super()
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

  contains (point) {
    return this.x <= point.x &&
      point.x <= this.bound.x &&
      this.y <= point.y &&
      point.y <= this.bound.y
  }
}

module.exports = Rec2
