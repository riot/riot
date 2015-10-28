var isNode = typeof window === 'undefined'

describe('Riot Tests', function() {
  if (isNode) {
    global.riot = require('../lib/server')
    //global.compiler = require('../lib/server/compiler')
    global.compiler = require('riot-compiler')
    global.expect = require('expect.js')
    require('./specs/node')
    require('./specs/compiler-server')
  }
})
