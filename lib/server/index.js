
// allow to require('riot')
const
  path = require('path'),
  fs = require('fs'),
  hasRiotPath = !!process.env.RIOT,
  riotPath = path.normalize(process.env.RIOT || path.resolve(__dirname, '..', '..', 'riot')),
  riot = require(riotPath),
  // simple-dom helper
  sdom = require('./sdom'),
  Module = require('module'),
  compiler = require('riot-compiler')

// fix #2225
// rollup considers the riot.default key as default export value instead of what we export here
delete riot.default

// time riot should wait before throwing during an async rendering
riot.settings.asyncRenderTimeout = 1000

/**
 * Function that will be used by riot.require and by require('some.tag')
 * @param   { String } filename - path to the file to load and compile
 * @param   { Object } opts     - compiler options
 * @param   { Object } context  - context where the tag will be mounted (Module)
 */
function loadAndCompile(filename, opts, context) {
  const src = compiler.compile(fs.readFileSync(filename, 'utf8'), opts)
  const preTag = src.substring(0, src.indexOf('riot.tag'))
  const tagDefinition = src.substring(src.indexOf('riot.tag'))

  // here we will use template strings in riot@3.0.0
  context._compile(`
    var riot = require('${ hasRiotPath ? riotPath : 'riot' }')
    ${ preTag }
    module.exports = ${ tagDefinition }
  `, filename)
}

/**
 * Enable the loading of riot tags with options riot.require('some.tag', { template: 'pug' })
 * @param   { String } filename - path to the file to load and compile
 * @param   { Object } opts     - compiler options
 * @returns { String } tag name
 */
function riotRequire(filename, opts) {
  var module = new Module()
  module.id = module.filename = filename
  loadAndCompile(filename, opts, module)
  return module.exports
}

// allow to require('some.tag')
require.extensions['.tag'] = function(module, filename) {
  loadAndCompile(filename, {}, module)
}

/**
 * Get the html as string form any riot tag instance
 * @param   { Tag } tag - riot tag instance
 * @returns { String }  tag template
 */
function getTagHtml(tag) {
  return sdom.serialize(tag.root)
}

/**
 * Render riot tags returning a strings
 * @param   { String } tagName - tag identifier
 * @param   { Object } opts    - options to pass to the tag
 * @returns { String } tag resulting template
 */
function render(tagName, opts) {
  var tag = render.tag(tagName, opts),
    html = getTagHtml(tag)
  // unmount the tag avoiding memory leaks
  tag.unmount()
  return html
}

/**
 * Render riot tags asynchronously
 * @param   { String } tagName - tag identifier
 * @param   { Object } opts    - options to pass to the tag
 * @returns { Promise } a promise resolved with the tag template string
 */
function renderAsync(tagName, opts) {
  return Promise.race([
    new Promise((resolve, reject) => {
      setTimeout(function() {
        reject(new Error(`Timeout error:: the tag "${ tagName }" didn\'t trigger the "ready" event during the rendering process`))
      }, riot.settings.asyncRenderTimeout)
    }),
    new Promise(resolve => {
      var tag = render.tag(tagName, opts)
      tag.on('ready', function() {
        var html = getTagHtml(tag)
        tag.unmount()
        resolve(html)
      })
    })
  ])
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
module.exports = exports.default = Object.assign(riot, {
  // allow to require('riot').compile
  compile: compiler.compile,
  parsers: compiler.parsers,
  require: riotRequire,
  render,
  renderAsync
})
