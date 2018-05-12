#!/usr/bin/env node

const exit = require('zeelib/lib/exit')

if (module.parent) {
  console.error('Please install wmjs globally')
  exit(1)
}

require('./src')
