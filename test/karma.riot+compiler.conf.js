var karmaConf = require('./karma.conf')

module.exports = function(conf) {
  conf.set(karmaConf({
    testFiles: './specs/compiler/**/*.spec.js'
  }))
}