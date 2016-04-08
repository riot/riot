
global.window = require('jsdom').jsdom().defaultView
global.document = window.document
global.body = window.document.body
global.history = {}

const
  Benchmark = require('benchmark'),
  suite = new Benchmark.Suite(),
  riot = require('../../../dist/riot/riot'),
  oldRiot = require('./riot.2.2.0'),
  ifBench = require('./if.bench'),
  loopBench = require('./loop.bench'),
  loopNoReorderBench = require('./loop-no-reorder.bench'),
  mountBench = require('./mount.bench')

// old
ifBench(suite, 'riot-old#if', oldRiot)
loopBench(suite, 'riot-old#loop', oldRiot)
mountBench(suite, 'riot-old#mount', oldRiot)

// new
ifBench(suite, 'riot-new#if', riot)
loopBench(suite, 'riot-new#loop', riot)
loopNoReorderBench(suite, 'riot-new#loop-no-reorder', riot)
mountBench(suite, 'riot-new#mount', riot)

suite
  .on('cycle', function(event) {
    console.log(String(event.target))
  })
  .on('error', function(e) {
    console.log(e.target.error)
  })
  .run({async: true})