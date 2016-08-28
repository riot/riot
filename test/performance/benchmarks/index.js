
global.window = require('jsdom').jsdom().defaultView
global.document = window.document
global.body = window.document.body
global.history = {}

/**
 * Check the memory usage analizing the heap
 * @param  { function } fn
 * @return { array } memory used + duration
 */

function measure(fn) {
  var startTime = Date.now()
  return [process.memoryUsage().heapUsed, Date.now() - startTime]
}

const
  Benchmark = require('benchmark'),
  suite = new Benchmark.Suite(),
  riotPath = process.argv[2],
  riot = require(riotPath),
  ifBench = require('./if.bench'),
  loopBench = require('./loop.bench'),
  loopNoReorderBench = require('./loop-no-reorder.bench'),
  mountBench = require('./mount.bench')

console.log(`Testing: ${ riotPath }`)

// brand new
ifBench(suite, 'if', riot)
loopBench(suite, 'loop', riot)
if (!/2.2/.test(riotPath)) loopNoReorderBench(suite, 'loop-no-reorder', riot)
mountBench(suite, 'mount', riot)

suite
  .on('cycle', function(event) {
    var mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    console.log(String(event.target), `Memory usage: ${ mem } MiB`)
  })
  .on('error', function(e) {
    console.log(e.target.error)
  })
  .run({async: true})