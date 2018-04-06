# wmjs

[WIP]

Tiling X window manager in Node, emphasizing Configuration Over Convention.

![screenshot](http://zacanger.com/assets/wmjs.png)

* [Changelog](./CHANGES.md)
* [Roadmap](./TODO.md)

--------

## Known Issues

Pretty much nothing actually works.

## Installation

`npm i -g wmjs`

## Usage

This is pretty crappy, right now. To check it out, clone this repo and do
`./run.sh` (you'll need to have Xephyr installed). To stop that, `./stop.sh`.

To use with `startx`, put something like this in your `~/.xinitrc`:

```
#!/bin/sh

xrdb -merge ~/.Xresources
exec wmjs # add this line
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

You'll also need a terminal, and I recommend having `dmenu`.

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
  modKey: keys.ALT, // main mod key
  startupPrograms: [ // an array of things to spawn on start
    'xflux -z 84047',
    'dropbox-cli start'
  ],
  borderWidth: 1, // width of window borders
  borderColor: 'FFFFFF', // color for borders (hex)
  keybinds: {
    [`${keys.SUPER}+${keys.SPACE}`]: run('dmenu_run'),
    [`${keys.SUPER}+${keys.SHIFT}+${keys.RETURN}`]: alert(process.env) // whatever
  }
})
```

If no config file is provided, we just use the defaults. The config file should
use CommonJS modules, at least until Node natively supports ESM.

## Prior Art

This is heavily based on code from the following projects:

* [tiles](https://github.com/dominictarr/tiles)
* [node-tinywm](https://github.com/Airblader/node-tinywm), which is an
  implementation of [tinywm](http://incise.org/tinywm.html)
* example code from [x11](https://github.com/sidorares/node-x11)

## Recommended Applications

You can use any programs you like, but these fit well with minimalistic window
managers.

* Browser: Qutebrowser
  * Alternatives: min, uzbl, dwb
  * More extreme: w3m, Lynx, elinks
* File manager: Ranger
  * Alternatives: noice, rover, nnn
* Editor: Neovim
  * Alternatives: Vim, vi, Emacs
* Audio player: Angrplayer
  * Alternatives: moc, cmus, mplayer
* Video: mpv
  * Alternatives: mplayer
* Terminal emulator: st
  * Alternatives: urxvt, rxvt, xterm

## License

[MIT](./LICENSE.md)
