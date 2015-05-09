var compilerPath = require('path').join(__dirname, '../shared/compiler.js')

global.riot = require(process.env.RIOT || '../../riot')
global.riot.parsers = require('./parsers')

// Evaluate the compiler shared functions in this context
/*eslint-disable*/
eval(require('fs').readFileSync(compilerPath, 'utf8'))
/*eslint-enable*/

module.exports = {
  compile: compile,
  html: compileHTML,
  style: compileCSS,
  js: compileJS
}