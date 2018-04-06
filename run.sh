#!/bin/sh

set -eu

Xephyr -ac -br -noreset -screen 1024x768 :4 &
  DISPLAY=:4 node ./index.js
