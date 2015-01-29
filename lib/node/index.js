
// For browserify, export riot.js
var self = module.exports = require('../../riot')

// For node, export riot+compiler.js
if(!process.browser) self.compiler = require('../../riot+compiler')
