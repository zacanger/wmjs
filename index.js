#!/usr/bin/env node

if (module.parent) {
  console.error('Please install wmjs globally')
  process.exit(1)
}

require('./src/keys')
