
var isNode = typeof window === 'undefined'

if (isNode) {
  before(function(next) {
    require('jsdom').env({
      html: '<!doctype html><html><head></head><body></body></html>',
      done: function(errors, window) {
        global.window = window
        global.document = window.document
        global.location = window.location
        next()
      }
    })
  })

  global.riot = require('../dist/riot/riot')
  global.expect = require('expect.js')
  require('./specs/compiler-cli') // TODO: fix some tests
  require('./specs/tmpl')
  require('./specs/observable')
  // At moment it's not possible to run these tests on node
  // require('./specs/route')
} else {
  mocha.run()
}