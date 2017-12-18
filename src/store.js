// const store = require('./store')
// const state = store()
// state.subscribe((new, prev) => new.foo)
// state.setState({ foo: 'bar' })

const store = (state = {}) => {
  let ls = []

  return {
    subscribe: (l) => {
      ls.push(l)
    },
    unsubscribe: (l) => {
      if (ls.includes(l)) {
        ls.splice(ls.indexOf(l), 1)
      }
    },
    setState: (n) => {
      const p = state
      state = Object.assign(
        {},
        p,
        typeof n === 'function' ? n(p) : n
      )
      for (let i = 0; i < ls.length; i++) {
        ls[i](state, p)
      }
    },
    getState: () => state
  }
}

module.exports = store
