
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

   it("Empty template", function() {
      assert($.render() === "");
   })

   it("Nearby brackets", function() {
      assert($.render("{{x}", { x: 'x' }) == "{x");
      assert($.render("{x}}", { x: 'x' }) == "x}");
      assert($.render("{{x}}", { x: 'x' }) == "{x}");
   })

   it("<template> tag", function() {
      assert($.render($("#test1").html(), {x: 'x'}) == "x");
      // \u2028, and \u2029.
   })

})
