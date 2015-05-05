
// allow to require('riot')
var riot = module.exports = require(process.env.RIOT || '../../riot')

// allow to require('riot').compile
riot.compile = require('./compiler').compile

// allow to require('some.tag')
require.extensions['.tag'] = function(module, filename) {
  var src = riot.compile(require('fs').readFileSync(filename, 'utf8'))
  module._compile('module.exports = ' + src, filename)
}

// simple-dom helper
var sdom = require('./sdom')

riot.render = function(tagName, opts) {
  var root = document.createElement(tagName)
  var tag = riot.mount(root, opts)
  return sdom.serialize(root)
}
