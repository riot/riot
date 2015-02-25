var assert = require('assert')

process.env.RIOT = '../dist/riot/riot'
var riot = require('..')

assert.ok(require('./tag/timer.tag'))