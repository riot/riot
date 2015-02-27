
var isNode = typeof window === 'undefined'

describe('Riotjs tests', function() {
  if (isNode) {

    global.compiler = require('../lib/compiler')
    global.expect = require('expect.js')
    require('./specs/compiler-cli') // TODO: fix some tests
    require('./specs/scoped-css')
  } else {
    mocha.run()
  }
})