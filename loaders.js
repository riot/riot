if (typeof exports === 'object') {
  // CommonJS support
  module.exports = riot;
} else if (typeof define === 'function' && define.amd) {
  // support AMD
  define(function() { return riot; });
} else {
  // support browser
  window.riot = riot;
}

