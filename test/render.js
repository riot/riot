describe("$.render", function() {
   it("Single token", function() {
      assert.equal($.render("x"), "x");
      assert.equal($.render("x", {}), "x");
      assert.equal($.render("{x}", { x: "x" }), "x");
      assert.equal($.render("{x}", { x: "z" }), "z");
   });

   it("Multiple tokens", function() {
      assert($.render("{x}{y}", { x: "x", y: "y" }) == "xy");
   });

   it("Single quotes", function() {
      assert.equal($.render("'x'"), "'x'");
      assert.equal($.render("\'x.\';"), "\'x.\';");
   });

   it("Empty value", function() {
      assert.equal($.render("{x}", { x: undefined }), "");
      assert.equal($.render("{x}", { x: null }), "");
   });

   it("Nearby brackets", function() {
      assert.equal($.render("{{x}", { x: 'x' }), "{x");
      assert.equal($.render("{x}}", { x: 'x' }), "x}");
      assert.equal($.render("{{x}}", { x: 'x' }), "{x}");
   });

   it("Line breaks", function() {
      assert.equal($.render("x\r"), "x\r");
      assert.equal($.render("x\n"), "x\n");
   });
});
