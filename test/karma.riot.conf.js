var karmaConf = require('./karma.conf')

module.exports = function(conf) {
  conf.set(karmaConf({
    testFiles: './specs/browser/**/*.spec.js'
  }))
}