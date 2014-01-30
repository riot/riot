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

  it("Converts unicode paragraph separators", function(){
    assert.equal($.render("x\u2028"), "x\n");
    assert.equal($.render("x\u2029"), "x\n");
  });

  it("Escapes backslashes", function(){
    assert.equal($.render("x\\y"), "x\y");
    assert.equal($.render("x\y"), "x\y");
    assert.equal($.render("x\\x"), "x\\x");
    assert.equal($.render("x\\u"), "x\\u");
    assert.equal($.render("x\\xt"), "x\\xt");
  });
});
