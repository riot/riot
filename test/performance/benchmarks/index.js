
global.window = require('jsdom').jsdom().defaultView
global.document = window.document
global.body = window.document.body
global.history = {}

const
  Benchmark = require('benchmark'),
  suite = new Benchmark.Suite(),
  riotPath = process.argv[2],
  riot = require(riotPath),
  ifBench = require('./if.bench'),
  loopBench = require('./loop.bench'),
  loopBenchReverse = require('./loop-reverse.bench'),
  loopNoReorderBench = require('./loop-no-reorder.bench'),
  mountBench = require('./mount.bench')

console.log(`Testing: ${ riotPath }`)

// brand new
mountBench(suite, 'mount', riot)
ifBench(suite, 'if', riot)
loopBench(suite, 'loop', riot)
loopBenchReverse(suite, 'loop-reverse', riot)
loopNoReorderBench(suite, 'loop-no-reorder', riot)

suite
  .on('cycle', function(event) {
    var mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    console.log(String(event.target), `Memory usage: ${ mem } MiB`)
  })
  .on('error', function(e) {
    console.log(e.target.error)
  })
  .run({async: false})