
var isNode = typeof window === 'undefined'

if (isNode) {
  before(function(next) {
    require('jsdom').env({
      html: '<!doctype html><html><head></head><body></body></html>',
      done: function(errors, window) {
        global.window = window
        global.document = window.document
        next()
      }
    })
  });

  var chai = require('chai')
  global.riot = require('../dist/riot/riot')
  global.expect = chai.expect
  require('./specs/tmpl')
} else {
  mocha.run()
}