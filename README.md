# wmjs

X window manager for Node.

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
Exec=wmjs
Icon=wmjs
Type=XSession
X-LightDM-DesktopName=wmjs
DesktopNames=wmjs
```

## Prior Art

Right now, this is mostly a fork of
[node-tinywm](https://github.com/Airblader/node-tinywm), which is an
implementation of [tinywm](http://incise.org/tinywm.html) in JS. I'll probably
have a long list here.

## License

[WTFPL](./LICENSE.md)
