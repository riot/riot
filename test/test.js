function test (self, console){

  self.describe = function(description, fn) {
    console.group(description);
    fn.call(self);
    console.groupEnd();
  };

  self.it = function(description, fn) {
    try {
      fn();
      console.log(description);
    } catch (err) {
      console.error(err +" (" + description + ")");
    }
  };

  self.assert = function(ok, details){
    if (!ok) throw (details || "Assertion Failed");
  };

};
