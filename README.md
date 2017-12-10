# wmjs

X window manager for Node.

![screenshot](http://zacanger.com/assets/wmjs.png)

* [Changelog](./CHANGES.md)
* [Roadmap](./TODO.md)

--------

## Installation

`npm i -g wmjs`

## Usage

This doesn't really work yet. To check it out, clone this repo and do
`./run.sh` (you'll need to have Xephyr installed). To stop that, `killall
Xephyr`, I guess.

To make this available to your session manager, put something like this in
`/usr/share/xsessions` (works on Debian, not tested on anything else):

```
[Desktop Entry]
Encoding=UTF-8
Name=wmjs
Comment=Window manger in node
Exec=/path/to/wmjs
Icon=wmjs
Type=XSession
X-LightDM-DesktopName=wmjs
DesktopNames=wmjs
```

Where `/path/to/wmjs` is something like `/usr/local/bin/wmjs` (see `npm bin -g`).

## Prior Art

Right now, this is mostly a fork of
[node-tinywm](https://github.com/Airblader/node-tinywm), which is an
implementation of [tinywm](http://incise.org/tinywm.html) in JS. I'll probably
have a long list here.

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
