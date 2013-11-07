
describe("$.render", function() {

   it("Simple ", function() {
      assert($.render("x") == "x");
      assert($.render("x", {}) == "x");
      assert($.render("{x}", { x: "x" }) == "x");
   })

   it("Single quotes", function() {
      assert($.render("'x'") == "'x'");
      assert($.render("\'x.\';") == "\'x.\';");
   })

   it("Empty value", function() {
      assert($.render("{x}", { x: undefined }) == "");
      assert($.render("{x}", { x: null }) == "");
   })

})