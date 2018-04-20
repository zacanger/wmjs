# wmjs

![icon](/icon.png?raw=true)

[WIP]

Tiling X window manager in Node.

![screenshot](/screenshot.png?raw=true)

* [Changelog](./CHANGES.md)

--------

## Known Issues

Lots.

## What Works

* Tiling, sort of, but I wouldn't recommend opening more than three windows
* Closing windows, but reopening them is weird
* Launching programs (if you have `dmenu` installed, or see the config section)

## Installation

`npm i -g wmjs`

## Usage

I wouldn't recommend using this as your main WM just yet. To check it out, clone
this repo and do `./run.sh` (you'll need to have Xephyr installed). To stop
that, `./stop.sh`.

To use with `startx`, put something like this in your `~/.xinitrc`:

```
#!/bin/sh

exec wmjs
```

If you use a graphical session manager, you'll need a file under
`/usr/share/xsessions`:

```
[Desktop Entry]
Encoding=UTF-8
Name=wmjs
Comment=Tiling X window manager in Node
Exec=/path/to/wmjs
Icon=wmjs
Type=XSession
X-LightDM-DesktopName=wmjs
DesktopNames=wmjs
```

Where `/path/to/wmjs` is something like `/usr/local/bin/wmjs` (see `npm bin -g`).

## Requirements

To run in Xephyr, you need Xephyr.

You'll also need a terminal and `dmenu` or some other launcher (see config
below).

## Configuration

`wmjs` can use an optional config file. This should be resolvable under
`~/.config/wmjs`. Since it should be a module, that means you could have any of
the following:

* `~/.config/wmjs.js`
* `~/.config/wmjs/index.js`
* Any file under `~/.config/wmjs/*.js` if you have a `package.json` in that
  directory with a `main` field.

Your config file should be a function that returns an object. It will be passed
a single object as an argument, with these properties:

* `keys`: a map of keys in the format `keys.SUPER: keycode, keys.SPACE: keycode`, etc.
* `run`: a wrapper for `child_process.spawn`
* `defaults`: all defaults

Example:

```javascript
const alert = require('alert-node')

module.exports = ({ keys, run, defaults }) => ({
  ...defaults,
  modKey: keys.SUPER, // main mod key // doesn't do anything yet
  startupPrograms: [ // an array of things to spawn on start
    'xflux -z 84047',
    'dropbox-cli start',
    'compton -b'
  ],
  launcher: 'dmenu_run',
  borderWidth: 1, // width of window borders
  borderColor: 'FFFFFF', // color for borders (hex)
  keybinds: { // doesn't do anything yet
    [`${keys.SUPER}+${keys.SPACE}`]: run('dmenu_run'),
    [`${keys.SUPER}+${keys.SHIFT}+${keys.RETURN}`]: alert(process.env) // whatever
  },
  // when truthy, logs go to `/tmp/wmjs-${DATE-TIMESTAMP}.log`
  debugLog: false, // doesn't do anything yet
  terminal: 'xterm', // terminal to spawn
})
```

If no config file is provided, we just use the defaults. The config file should
use CommonJS modules, at least until Node natively supports ESM.

## Recommended Applications

You can use any programs you like, but these fit well with minimalistic window
managers.

* Browser: Qutebrowser, uzbl, dwb, min, w3m, Lynx, elinks
* File manager: Ranger, noice, rover, nnn
* Editor: Neovim, Vim, vi, Emacs
* Audio player: Angrplayer, moc, cmus, mplayer
* Video: mpv, mplayer
* Terminal emulator: st, urxvt

## TODO

Pretty much everything.

* Automatically install xsession file, add to alternatives (Debian), and install icon
* Properly set wmname (NETWM, see EWMH/wm-spec)
* Tiling:
  * Automatic works, but it's bad
    * Remove the buggy existing code
    * Do what `catwm` does -- assume a primary window and other windows
  * Make manual work also (like in i3)
  * Resize with keybinds
  * Switch focus with keybinds
    * There's code for this now, but it's super+arrows
  * Move windows with keybinds
    * There's code for this now, but it's not mapped to anything real I think?

#### Config Things

All default keybinds should rely on modKey (which we'll default to SUPER, which
is the Windows key on many keyboards). We should keep default keybinds minimal.

```
MODKEY+SPACE: dmenu_run
MODKEY+RETURN: x-terminal-emulator
MODKEY+ARROWS: snap to corner (quarter of screen)
MODKEY+SHIFT+ARROWS: snap to halves of screen
```

Configs should be hot reloaded (shouldn't need to restart the WM to reload
config).

## Prior Art and Thanks

Icon made using [make 8-bit art](https://make8bitart.com).

wmjs is heavily based on code from the following projects:

* [tiles](https://github.com/dominictarr/tiles)
* [node-tinywm](https://github.com/Airblader/node-tinywm), which is an
  implementation of [tinywm](http://incise.org/tinywm.html)
* example code from [x11](https://github.com/sidorares/node-x11)
* Inspiration from [i3](https://i3wm.org),
  [catwm](https://github.com/pyknite/catwm), and tons of other awesome projects.

## License

[MIT](./LICENSE.md)
