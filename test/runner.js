describe('Riot Tests', function() {
  global.expect = require('expect.js')
  require('./specs/server/node')
  require('../node_modules/riot-compiler/test/runner')
})
