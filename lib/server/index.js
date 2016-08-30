
// allow to require('riot')
const
  path = require('path'),
  fs = require('fs'),
  riotPath = process.env.RIOT || path.resolve(__dirname, '../../riot'),
  riot = require(riotPath),
  // simple-dom helper
  sdom = require('./sdom'),
  compiler = require('riot-compiler'),
  cache = {}

// shared function that will be used by riot.load and by require('some.tag')
function loadAndCompile(filename, opts) {
  var src = compiler.compile(fs.readFileSync(filename, 'utf8'), opts)
  var hasGlobalRiot = typeof global.riot !== 'undefined'
  if (!hasGlobalRiot) global.riot = riot
  module._compile(`module.exports = ${ src }`, filename)
  if (!hasGlobalRiot) delete global.riot
}

// enable the loading of riot tags with options riot.require('some.tag', { template: 'pug' })
function riotRequire(filename, opts) {
  if (cache[filename]) {
    return cache[filename]
  }
  loadAndCompile(filename, opts)
  return cache[filename] = module.exports
}

// allow to require('some.tag')
require.extensions['.tag'] = function(module, filename) {
  loadAndCompile(filename)
}

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

// extend the riot api adding some useful serverside methods
module.exports = exports.default = Object.assign({
  // allow to require('riot').compile
  compile: compiler.compile,
  parsers: compiler.parsers,
  require: riotRequire,
  render
}, riot)








