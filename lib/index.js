var fs = require('fs')

var riot = module.exports = require('./compiler')

require.extensions['.tag'] = function(module, filename) {
  var src = riot.compile(fs.readFileSync(filename, 'utf8'))
  module._compile(src, filename)
}