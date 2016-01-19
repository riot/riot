  // support CommonJS, AMD & browser
  /* istanbul ignore next */
  if (typeof exports === T_OBJECT)
    module.exports = riot
  else if (typeof define === T_FUNCTION && typeof define.amd !== T_UNDEF)
    define(function() { return riot })
  else
    window.riot = riot

})(typeof window != 'undefined' ? window : void 0);
