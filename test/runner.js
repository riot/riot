var isNode = typeof window === 'undefined'

describe('Riot Tests', function() {
  if (isNode) {
    global.expect = require('expect.js')
    require('./specs/node')
    require('./specs/compiler-server')
  }
})
