Pretty much everything.

* Automatically install xsession file, add to alternatives, and install icon
* Make an icon
* Resize windows with mouse
* Handle alt+click to drag
* Wallpaper
* Stacking
* Mouse things:
  * Alt+drag to move
  * Middle button - ?
  * Right button - ? maybe right-click menu, as in CWM?
* Window decorations?
* Tiling?:
  * Could be based on keybinds, not true tiling, just snapping
  * If true tiling, resize with keybinds, swapping panes
  * Saved layouts? (Probably not)
* Configurable background window transparency?

## config thoughts

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
