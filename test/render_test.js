describe("riot.render", function() {

  it("Single token", function() {
    assert.equal(riot.render("x"), "x");
    assert.equal(riot.render("x", {}), "x");
    assert.equal(riot.render("{x}", { x: "x" }), "x");
    assert.equal(riot.render("{x}", { x: "z" }), "z");
  });

  it("Multiple tokens", function() {
    assert(riot.render("{x}{y}", { x: "x", y: "y" }) == "xy");
  });

  it("Single quotes", function() {
    assert.equal(riot.render("'x'"), "'x'");
    assert.equal(riot.render("\'x.\';"), "\'x.\';");
  });

  it("Empty value", function() {
    assert.equal(riot.render("{x}", { x: undefined }), "");
    assert.equal(riot.render("{x}", { x: null }), "");
    assert.equal(riot.render("{x}", { x: true }), "true");
    assert.equal(riot.render("{x}", { x: false }), "false");
    assert.equal(riot.render("{x}", { x: 0 }), "0");
  });

  it("With spaces", function() {
    assert.equal(riot.render("{ x }", { x: 'x' }), "x");
    assert.equal(riot.render("{x }", { x: 'x' }), "x");
    assert.equal(riot.render("{ x}", { x: 'x' }), "x");
    assert.equal(riot.render("{  x  }", { x: 'x' }), "x");
  });

  it("Empty template", function() {
    assert(riot.render() === "");
  });

  it("Nearby brackets", function() {
    assert.equal(riot.render("{{x}", { x: 'x' }), "{x");
    assert.equal(riot.render("{x}}", { x: 'x' }), "x}");
    assert.equal(riot.render("{{x}}", { x: 'x' }), "{x}");
  });

  if (typeof jQuery == "function") {
    it("<template> tag", function() {
      assert($.trim(riot.render($("#test1").html(), {x: 'x'})) == "x");
    });
  }

  it("Newline characters", function() {
    assert.equal(riot.render("x\r"), "x\r");
    assert.equal(riot.render("x\n"), "x\n");
  });

  it("Backslashes", function() {
    assert.equal(riot.render("\\{x}", { x: 'x' }), "\\x");
  });

  it("Escaping", function() {
    assert.equal(riot.render("{x}", { x: '&' }, true), "&amp;");
    assert.equal(riot.render("{x}", { x: '"' }, true), "&quot;");
    assert.equal(riot.render("{x}", { x: '<' }, true), "&lt;");
    assert.equal(riot.render("{x}", { x: '>' }, true), "&gt;");
  });

  it("Nested objects", function() {
    assert.equal(riot.render("{x.y}", { x: { y: 'x' }}), "x");
  });

  it("Undefined properties", function() {
    assert.equal(riot.render("{x}", {}), "");
  });

  it('Custom escape function', function(){
    var template = '{x}'
    ,   data = {x: 'custom-replace-function'}
    ,   escape_fn = function(text){ return text.replace(/-/g, '!')}
    ;
    assert.equal(riot.render(template, data, escape_fn), 'custom!replace!function');
  });

  it('Custom escape function args', function(){
    riot.render('{x}', { x: 'foo'}, function(val, key) {
      assert.equal(key, 'x');
      assert.equal(val, 'foo');
    });
  });

  it('Can be set to not escape', function(){
    var template = '{x}'
    ,   data = {x: '<script>test</script>'}
    ;
    assert.equal(riot.render(template, data), '<script>test</script>');
  });

});
