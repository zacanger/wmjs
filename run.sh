#!/bin/sh

set -eu

Xephyr -ac -br -noreset -screen 1024x768 :1 &
  DISPLAY=:1 node ./index.js
