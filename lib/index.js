//
// Riot CommonJS module
//

var fs = require('fs')
var tmpl = require('./tmpl')

var riot = module.exports = require('./compiler')
riot.settings = {}

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

riot.render = function(impl, opts) {
  var tag = {
    root: {},
    opts: opts,
    parent: {},
    update: function() {},
    on: function(e, cb) {
      if (e == 'unmount') cb()
    }
  }
  impl.fn.call(tag, opts || {})
  return tmpl(riot.settings)(impl.tmpl, tag)
}
