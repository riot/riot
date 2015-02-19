var fs = require('fs')

var riot = module.exports = require('./compiler')

var registered = false
riot.register = function(extension) {
  if (!registered) {
    require.extensions[extension || '.tag'] = function(module, filename) {
      var src = riot.compile(fs.readFileSync(filename, 'utf8'), { cjs: true })
      module._compile(src, filename)
    }
  }
  return riot
}