## config thoughts

(none of this is real, yet.)

Configuration should be under require.resolve XDG_CONFIG/wmjs. So, on my
machines that could be any of the following:

```
/home/z/.config/wmjs.js
/home/z/.config/wmjs/index.js
/home/z/.config/wmjs/any-other-path.js, as per package.main, if package.json exists
```

Config should be plain JS, and exports.default (module.exports, until ES modules
are in Node LTS) should be a function that returns a config object.

The function will be passed:
* `keys`: a map of keys in the format `keys.SUPER: keycode, keys.SPACE:
  keycode`, etc.
* `exec`: child_process.exec, or execa, or something
* `defaults`: all default configs
* Maybe other stuff, in the future.

If `require.resolve(xdg_config + wmjs)` fails, we just provide the default
config.

Example config file (assuming Node 8):

```javascript
const alert = require('alert-node')

module.exports = ({ keys, exec, defaults }) => ({
  ...defaults,
  modKey: keys.ALT, // main mod key; see below
  startupPrograms: [ // this name sucks; an array of things to exec on start
    'xflux -z 84047',
    'dmenu_run',
    'stterm',
    'dropbox start'
  ]
  keybinds: {
    [`${keys.SUPER}+${keys.SPACE}`]: exec('dmenu_run'),
    [`${keys.SUPER}+${keys.SHIFT}+${keys.RETURN}`]: alert(process.env) // whatever
  }
})

```

We should support Node LTS and latest, but not care about anything earlier.

All default keybinds should rely on modKey (which we'll default to SUPER, which
is the Windows key on many keyboards). We should keep default keybinds minimal.

```
MODKEY+SPACE: dmenu_run
MODKEY+RETURN: x-terminal-emulator
MODKEY+ARROWS: snap to corner (quarter of screen)
MODKEY+SHIFT+ARROWS: snap to halves of screen
```

A `debugLog` (names are hard?) should be false by default in the config. When
truthy, we should log stuff to a file. By default this could be something like
`/tmp/wmjs-${DATE-TIMESTAMP}.log` (if `debugLog: 1`), but if debugLog is a
string that seems to be a path, we should write there instead.

Configs should be hot reloaded (shouldn't need to restart the WM to reload
config).
