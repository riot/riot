describe("Riot.render", function() {

  it("Single token", function() {
    assert.equal(Riot.render("x"), "x");
    assert.equal(Riot.render("x", {}), "x");
    assert.equal(Riot.render("{x}", { x: "x" }), "x");
    assert.equal(Riot.render("{x}", { x: "z" }), "z");
  });

  it("Multiple tokens", function() {
    assert(Riot.render("{x}{y}", { x: "x", y: "y" }) == "xy");
  });

  it("Single quotes", function() {
    assert.equal(Riot.render("'x'"), "'x'");
    assert.equal(Riot.render("\'x.\';"), "\'x.\';");
  });

  it("Empty value", function() {
    assert.equal(Riot.render("{x}", { x: undefined }), "");
    assert.equal(Riot.render("{x}", { x: null }), "");
    assert.equal(Riot.render("{x}", { x: false }), "");
    assert.equal(Riot.render("{x}", { x: 0 }), "0");
  });

  it("With spaces", function() {
    assert.equal(Riot.render("{ x }", { x: 'x' }), "x");
    assert.equal(Riot.render("{x }", { x: 'x' }), "x");
    assert.equal(Riot.render("{ x}", { x: 'x' }), "x");
    assert.equal(Riot.render("{  x  }", { x: 'x' }), "x");
  });

  it("Empty template", function() {
    assert(Riot.render() === "");
  })

  it("Nearby brackets", function() {
    assert.equal(Riot.render("{{x}", { x: 'x' }), "{x");
    assert.equal(Riot.render("{x}}", { x: 'x' }), "x}");
    assert.equal(Riot.render("{{x}}", { x: 'x' }), "{x}");
  });

  if (Riot.trim) {
    it("<template> tag", function() {
      assert(Riot.trim(Riot.render(Riot("#test1").html(), {x: 'x'})) == "x");
    });
  }

  it("Line breaks", function() {
    assert.equal(Riot.render("x\r"), "x\r");
    assert.equal(Riot.render("x\n"), "x\n");
  });

});
