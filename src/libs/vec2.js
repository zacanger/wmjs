function Vec2 (x, y) {
  if (!(this instanceof Vec2)) {
    return new Vec2(x, y)
  }

  if (Array.isArray(x)) {
    y = x[1]
    x = x[0]
  } else if (x && typeof x === 'object') {
    y = x.y
    x = x.x
  }

  this.x = Vec2.clean(x || 0)
  this.y = Vec2.clean(y || 0)
}

Vec2.prototype = {
  change: function (fn) {
    if (typeof fn === 'function') {
      if (this.observers) {
        this.observers.push(fn)
      } else {
        this.observers = [fn]
      }
    } else if (this.observers && this.observers.length) {
      for (let i = this.observers.length - 1; i >= 0; i--) {
        this.observers[i](this, fn)
      }
    }

    return this
  },

  // set x and y
  set: function (x, y, notify) {
    if (typeof x !== 'number') {
      notify = y
      y = x.y
      x = x.x
    }

    if (this.x === x && this.y === y) {
      return this
    }

    let orig = null
    if (notify !== false && this.observers && this.observers.length) {
      orig = this.clone()
    }

    this.x = Vec2.clean(x)
    this.y = Vec2.clean(y)

    if (notify !== false) {
      return this.change(orig)
    }
  },

  // return a new vector with the same component values
  // as this one
  clone: function () {
    return new (this.constructor)(this.x, this.y)
  },

  // Add the incoming `vec2` vector to this vector
  add: function (x, y, returnNew) {
    if (typeof x !== 'number') {
      returnNew = y
      if (Array.isArray(x)) {
        y = x[1]
        x = x[0]
      } else {
        y = x.y
        x = x.x
      }
    }

    x += this.x
    y += this.y

    if (!returnNew) {
      return this.set(x, y)
    } else {
      // Return a new vector if `returnNew` is truthy
      return new (this.constructor)(x, y)
    }
  },

  // Calculate the length of this vector
  length: function () {
    const x = this.x
    const y = this.y
    return Math.sqrt(x * x + y * y)
  },

  toJSON: function () {
    return { x: this.x, y: this.y }
  },

  constructor: Vec2
}

// Floating point stability
Vec2.precision = 8

Vec2.clean = function (val) {
  if (isNaN(val)) {
    throw new TypeError('NaN detected')
  }

  if (!isFinite(val)) {
    throw new TypeError('Infinity detected')
  }

  if (Math.round(val) === val) {
    return val
  }

  const p = Math.pow(10, Vec2.precision)
  return Math.round(val * p) / p
}

module.exports = Vec2
