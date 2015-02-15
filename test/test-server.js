var fs = require('fs')
var glob = require('glob')
var riot = require('../lib').install()

var tags = glob.sync('./tag/*.tag', { cwd: __dirname })
tags.forEach(function(tag) {
  riot.tag(require(tag))
})

riot.doc(fs.readFileSync(__dirname + '/test-server.html', 'utf8'))

riot.mount('*', { start: 79 })

var res = riot.render()
console.log(res)
