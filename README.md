# wmjs

![logo](/logo.png?raw=true)

**[WIP]** only use this if you are very brave and don't need to get anything done.

Tiling X window manager in Node.

![screenshot](/screenshot.png?raw=true)

* [Changelog](./CHANGELOG.md)
* [TODO](./TODO.md)

--------

## Known Issues

Lots.

## What Works

* Tiling, mostly, but the code is janky
* Opening and closing windows
* Launching programs, if you have `dmenu` or some other launcher (see config)

## Installation

[Get Node](https://nodejs.org/en/about/releases/), then `npm i -g wmjs`

## Usage

I wouldn't recommend using this as your main WM just yet. To check it out, clone
this repo and `make run` (you'll need to have Xephyr installed). To stop
that, `make stop`.

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

#### Keybinds

Current keybinds:

```
SUPER+SPACE: dmenu_run (or launcher, see config)
SUPER+RETURN: terminal (see config)
SUPER+ARROWS: select tiles
SUPER+SHIFT+ARROWS: move tiles
```

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
* `defaults`: all other default config properties

Example:

```javascript
const alert = require('alert-node')

module.exports = ({ keys, run, ...defaults }) => ({
  ...defaults,
  startupPrograms: [ // an array of things to spawn on start
    'xflux -z 84047',
    'dropbox-cli start',
    'compton -b'
  ],
  launcher: 'dmenu_run',
  borderWidth: 1, // width of focused window borders
  borderColor: 'FFFFFF', // color for borders (hex)
  log: true, // logs go to ~/.local/share/wmjs/wmjs.log
  terminal: 'xterm', // terminal to spawn, see npm.im/get-term,
  focusFollowsMouse: false, // true by default

  // TODO: these don't do anything yet
  modKey: keys.SUPER, // main mod key // doesn't do anything yet
  keybinds: { // doesn't do anything yet
    [`${keys.SUPER}+${keys.SPACE}`]: run('dmenu_run'),
    [`${keys.SUPER}+${keys.SHIFT}+${keys.RETURN}`]: alert(process.env) // whatever
  },
})
```

If no config file is provided, we just use the defaults. The config file should
use CommonJS modules, at least until Node natively supports ESM.

## Recommended Applications

You can use any programs you like, but these fit well with minimalistic window
managers.

* Browser: Qutebrowser, w3m, Lynx, elinks
* File manager: Ranger, noice, rover, nnn, fff, lf
* Editor: Neovim, Vim, vi, Emacs
* Audio player: Angrplayer, moc, cmus, mplayer
* Video: mpv, mplayer
* Terminal emulator: xterm, urxvt
* Launcher: rofi, pmenu

## Prior Art and Thanks

wmjs is heavily based on code from the following projects:

* [tiles](https://github.com/dominictarr/tiles)
* [AirWM](https://github.com/airwm/airwm)
* [node-tinywm](https://github.com/Airblader/node-tinywm), which is an
  implementation of [tinywm](http://incise.org/tinywm.html)
* example code from [x11](https://github.com/sidorares/node-x11)
* Inspiration from [i3](https://i3wm.org),
  [catwm](https://github.com/pyknite/catwm), and tons of other awesome projects.

## License

[MIT](./LICENSE.md)
