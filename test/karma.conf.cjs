// karma.js doesn't support esm modules yet :(
module.exports = function (config) {
  return import('./karma.conf.js').then((val) => val.default(config))
}
