//
// Riot CommonJS module
//

var fs = require('fs')
var sdom = require('./tag/sdom')
var riotCompile = require('./compiler').compile

var riot = module.exports = require('./tag/vdom')
riot.settings.doc = sdom.createDocument()

riot.html = function(html) {
  var frag = sdom.parse(html)
  riot.settings.doc.body.appendChild(frag)
}

riot.render = function() {
  return sdom.serialize(riot.settings.doc)
}

var installed = false
riot.install = function(extension) {
  if (!installed) {
    require.extensions[extension || '.tag'] = function(module, filename) {
        var src = riotCompile(fs.readFileSync(filename, 'utf8'), { cjs: true })
        module._compile(src, filename)
    }
  }
  return riot
}
