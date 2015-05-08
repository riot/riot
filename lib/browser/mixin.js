riot.mixin = (function() {
  var registeredMixins = {}
  return function(name, mixin) {
    if (!mixin) return registeredMixins[name]
      else registeredMixins[name] = mixin
  }
})()
