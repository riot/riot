
describe("$.render", function() {

   it("Single token", function() {
      assert($.render("x") == "x");
      assert($.render("x", {}) == "x");
      assert($.render("{x}", { x: "x" }) == "x");
   })

   it("Multiple tokens", function() {
      assert($.render("{x}{y}", { x: "x", y: "y" }) == "xy");
   })

   it("Single quotes", function() {
      assert($.render("'x'") == "'x'");
      assert($.render("\'x.\';") == "\'x.\';");
   })

   it("Empty value", function() {
      assert($.render("{x}", { x: undefined }) == "");
      assert($.render("{x}", { x: null }) == "");
   })

   it("Nearby brackets", function() {
      assert($.render("{{x}", { x: 'x' }) == "{x");
      assert($.render("{x}}", { x: 'x' }) == "x}");
      assert($.render("{{x}}", { x: 'x' }) == "{x}");
   })


})