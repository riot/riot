describe('Riot Tests', function() {
  global.expect = require('expect.js')
  require('./specs/server/node')
  require('./specs/server/compiler')
})
