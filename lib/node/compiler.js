var compilerPath = require('path').join(__dirname, '../helpers/compiler-shared.js')

this.riot = require(process.env.RIOT || '../../riot')
this.riot.parsers = require('./parsers')

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