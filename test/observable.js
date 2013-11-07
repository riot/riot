
describe('Observable', function() {

   var el = observable({});

   it("Single listener", function() {

      el.on("a", function(arg) {
         assert(arg === true)
      });

      el.trigger("a", true);

   });

   it("Multiple listeners", function() {

      var count = 0;

      el.on("b c d", function(e) {
         if (++count == 3) assert(e == "d")
      });

      el.one("d", function(a) {
         assert(a === true)
      });

      el.trigger("b").trigger("c").trigger("d", true);

   });

   it("One", function() {

      var counter = 0;

      el.one("g", function() {
         assert(++counter == 1);
      });

      el.trigger("g").trigger("g");
   });


   it("Remove listeners", function() {

      var counter = 0;

      function r() {
         assert(++counter == 1);
      }

      el.on("r", r).on("s", r).off("s", r).trigger("r").trigger("s");

   });

   it("Remove multiple listeners", function() {

      var el = observable({}),
         counter = 0;

      function fn() {
         counter++;
      }

      el.on("a b", fn).on("c", fn).off("a b").off("c").trigger("a").trigger("b").trigger("c");

      assert(counter === 0);

   });


   it("Multiple arguments", function() {

      el.on("j", function(a, b) {
         assert(a == 1);
         assert(b[0] == 2);
      });

      el.trigger("j", 1, [2]);

   });


   it("Cancel propagation", function() {

      el.on("h", function() {
         return false;
      });

      el.on("h", function() {
         throw "should not be called";
      });

      el.trigger("h");

   });



})
