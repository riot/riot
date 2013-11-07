
function describe(msg, fn) {
   console.group(msg);
   fn();
   console.groupEnd();
}

function it(msg, fn) {
   try {
      fn();
      console.log(msg);
   } catch (err) {
      console.error(err + " (" + msg + ")");
   }
}

function assert(ok, msg) {
   if (!ok) throw (msg);
}