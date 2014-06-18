(function (global){
  "use strict"

  global.describe = function describe(msg, fn) {
    if (console.group) {
      console.group(msg);
      fn();
      console.groupEnd();
    } else {
      console.info("\n--- " + msg + " ---");
      fn();
    }
  }

  global.it = function it(msg, fn) {
    console.log(msg);
    fn();
  }

  global.assert = function assert(ok, msg) {
    console.assert(ok, msg);
  }

  assert.equal = function (value, expected) {
    assert(value === expected, '"'+ value +'" != "'+ expected +'"');
  };
}(typeof global !== "undefined" ? global : window))
