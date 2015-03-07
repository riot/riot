var isNode = typeof window === 'undefined'

describe('Riot Tests', function() {
  if (isNode) {
    global.riot = require('../lib/node')
    global.compiler = require('../lib/compiler')
    global.expect = require('expect.js')
    require('./specs/node')
    require('./specs/tmpl')
    require('./specs/compiler-cli')
  } else {
    mocha.run()
  }
})