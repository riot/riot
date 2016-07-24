
global.window = require('jsdom').jsdom().defaultView
global.document = window.document
global.body = window.document.body
global.history = {}

const
  Benchmark = require('benchmark'),
  suite = new Benchmark.Suite(),
  riot = require('../../../dist/riot/riot'),
  riot22 = require('./riot.2.2.0'),
  riot25 = require('./riot.2.5.0'),
  ifBench = require('./if.bench'),
  loopBench = require('./loop.bench'),
  loopNoReorderBench = require('./loop-no-reorder.bench'),
  mountBench = require('./mount.bench')

// 2.2.0
ifBench(suite, 'riot-2.2.0#if', riot22)
loopBench(suite, 'riot-2.2.0#loop', riot22)
mountBench(suite, 'riot-2.2.0#mount', riot22)

// new
ifBench(suite, 'riot-2.5.0#if', riot25)
loopBench(suite, 'riot-2.5.0#loop', riot25)
loopNoReorderBench(suite, 'riot-2.5.0#loop-no-reorder', riot25)
mountBench(suite, 'riot-2.5.0#mount', riot25)

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