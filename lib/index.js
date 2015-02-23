var fs = require('fs')
var compiler = require('./compiler')

var riot = module.exports = require(process.env.RIOT || '../riot')

require.extensions['.tag'] = function(module, filename) {
  var src = compiler.compile(fs.readFileSync(filename, 'utf8'))
  module._compile(src, filename)
}