# wmjs

X window manager for Node.

![screenshot](http://zacanger.com/wmjs.png)

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

## License

[MIT](./LICENSE.md)
