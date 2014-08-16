if (typeof exports === 'object') {
  // CommonJS support
  module.exports = riot;
} else if (typeof define === 'function' && define.amd) {
  // AMD support
  define(function() { return riot; });
} else {
  // browser support
  this.riot = riot;
}

