# TODO

Pretty much everything.

* Less bad key-handling code
* Workspaces
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
* Automatically install xsession file, add to alternatives (Debian), and install icon
* Properly set wmname (NETWM, see EWMH/wm-spec)
* Keybinds: arrows -> hjkl

#### Config Things

All default keybinds should rely on modKey (which we'll default to SUPER, which
is the Windows key on many keyboards). We should keep default keybinds minimal.

Configs should be hot reloaded (shouldn't need to restart the WM to reload
config).
