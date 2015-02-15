//
// Riot CommonJS module
//

var fs = require('fs')
var sdom = require('./sdom')

var riot = module.exports = require('./tag/vdom')
riot.compile = require('./compiler').compile

riot.doc = function(html) {
  var frag = sdom.parse(html)
  riot.settings.doc = sdom.createDocument()
  riot.settings.doc.firstChild = frag
}

riot.render = function() {
  return sdom.serialize(riot.settings.doc || '')
}

var installed = false
riot.install = function(extension) {
  if (!installed) {
    require.extensions[extension || '.tag'] = function(module, filename) {
        var src = riot.compile(fs.readFileSync(filename, 'utf8'), { cjs: true })
        module._compile(src, filename)
    }
  }
  return riot
}

riot.renderFile = function(filePath, options, callback) {
  fs.readFile(filePath, 'utf8', function (err, content) {
    if (err) throw new Error(err)
    riot.doc(content)
    riot.mount('*', options)
    var rendered = riot.render()
    return callback(null, rendered)
  })
}
