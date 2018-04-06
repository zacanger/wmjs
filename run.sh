#!/bin/sh

set -eu

Xephyr -ac -br -noreset -screen 1024x768 :2 &
  DISPLAY=:2 node ./index.js
