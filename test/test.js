
function describe(msg, fn) {
  if (console.group) {
    console.group(msg);
    fn();
    console.groupEnd();
  } else {
    console.info("---" + msg + "---");
    fn();
  }
}

function it(msg, fn) {
  try {
    fn();
    console.log(msg);
  } catch (err) {
    console.error(msg, err);
  }
}

function assert(ok, msg) {
  if (!ok) throw (msg || "fails");
}

assert.equal = function (value, expected) {
  assert(value === expected, value +" != "+ expected);
};
