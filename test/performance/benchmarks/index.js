const
  Benchmark = require('benchmark'),
  suite = new Benchmark.Suite(),
  riot = require('../../../dist/riot/riot'),
  jsdom = require('jsdom').jsdom,
  ifBench = require('./if.bench'),
  loopBench = require('./loop.bench'),
  loopNoReorderBench = require('./loop-no-reorder.bench'),
  mountBench = require('./mount.bench')

global.window = jsdom().defaultView
global.document = window.document

ifBench(suite, riot, window.document.body)
loopBench(suite, riot, window.document.body)
loopNoReorderBench(suite, riot, window.document.body)
mountBench(suite, riot, window.document.body)

suite
.on('cycle', function(event) {
  console.log(String(event.target))
})
.on('error', function(e) {
  console.log(e.target.error)
}).run({async: true})