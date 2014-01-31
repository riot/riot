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
    assert.equal($.render("{x}", { x: false }), "");
    assert.equal($.render("{x}", { x: 0 }), "0");
  });

  it("With spaces", function() {
    assert.equal($.render("{ x }", { x: 'x' }), "x");
    assert.equal($.render("{x }", { x: 'x' }), "x");
    assert.equal($.render("{ x}", { x: 'x' }), "x");
    assert.equal($.render("{  x  }", { x: 'x' }), "x");
  });

  it("Empty template", function() {
    assert($.render() === "");
  });

  it("Nearby brackets", function() {
    assert.equal($.render("{{x}", { x: 'x' }), "{x");
    assert.equal($.render("{x}}", { x: 'x' }), "x}");
    assert.equal($.render("{{x}}", { x: 'x' }), "{x}");
  });

  if ($.trim) {
    it("<template> tag", function() {
      assert($.trim($.render($("#test1").html(), {x: 'x'})) == "x");
    });
  }

  it("Line breaks", function() {
    assert.equal($.render("x\r"), "x\r");
    assert.equal($.render("x\n"), "x\n");
  });

  it("Passes through unicode paragraph separators", function(){
    assert.equal($.render("x\u2028"), "x\u2028");
    assert.equal($.render("x\u2029"), "x\u2029");
  });

  it("Passes through regular unicode characters", function(){
    assert.equal($.render("x\u1021"), "x\u1021");
  });

  it("Escapes backslashes", function(){
    assert.equal($.render("x\\y"), "x\y");
    assert.equal($.render("x\y"), "x\y");
    assert.equal($.render("x\\x"), "x\\x");
    assert.equal($.render("x\\u"), "x\\u");
    assert.equal($.render("a\\xa"), "a\\xa");
    assert.equal($.render("a\\ua"), "a\\ua");
  });

});
