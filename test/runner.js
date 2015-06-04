var isNode = typeof window === 'undefined'

describe('Riot Tests', function() {
  if (isNode) {
    global.riot = require('../lib/server')
    global.compiler = require('../lib/server/compiler')
    global.expect = require('expect.js')
    require('./specs/node')
    require('./specs/tmpl')
    require('./specs/compiler-cli')
    require('./specs/analyzer')
  } else {
    mocha.run()
  }
})
