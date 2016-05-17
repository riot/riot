
// allow to require('riot')
const riot = module.exports = require(process.env.RIOT || require('path').resolve(__dirname, '../../riot')),
  // simple-dom helper
  sdom = require('./sdom'),
  compiler = require('riot-compiler')


function render(tagName, opts) {
  var tag = render.tag(tagName, opts),
    html = sdom.serialize(tag.root)
  // unmount the tag avoiding memory leaks
  tag.unmount()
  return html
}

// extend the render function with some static methods
render.dom = function(tagName, opts) {
  return riot.render.tag(tagName, opts).root
}
render.tag = function(tagName, opts) {
  var root = document.createElement(tagName),
    tag = riot.mount(root, opts)[0]
  return tag
}

// allow to require('some.tag')
require.extensions['.tag'] = function(module, filename) {
  var src = compiler.compile(require('fs').readFileSync(filename, 'utf8'))
  module._compile(
    'var riot = require(process.env.RIOT || "riot/riot.js");module.exports =' + src
  , filename)
}

// extend the riot api adding some useful serverside methods
module.exports = exports.default = Object.assign({
  // allow to require('riot').compile
  compile: compiler.compile,
  parsers: compiler.parsers,
  render: render
}, riot)








