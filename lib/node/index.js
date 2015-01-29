
module.exports = process.browser
  
  // Browserify? Export riot.js
  ? require('../../riot')

  // Node? Export compiler.js
  : { compile: require('../../lib/compiler').compile }
