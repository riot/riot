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
    assert.equal($.render("{x}", { x: true }), "true");
    assert.equal($.render("{x}", { x: false }), "false");
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

  it("Newline characters", function() {
    assert.equal($.render("x\r"), "x\r");
    assert.equal($.render("x\n"), "x\n");
  });

  it("Backslashes", function() {
    assert.equal($.render("\\{x}", { x: 'x' }), "\\x");
  });

  it("Entities", function() {
    assert.equal($.render("{x}", { x: '&' }), "&amp;");
    assert.equal($.render("{x}", { x: '"' }), "&quot;");
    assert.equal($.render("{x}", { x: '<' }), "&lt;");
    assert.equal($.render("{x}", { x: '>' }), "&gt;");
  });

  it("Nested objects", function() {
    assert.equal($.render("{x.y}", { x: { y: 'x' }}), "x");
  });

  it("Undefined properties", function() {
    assert.equal($.render("{x}", {}), "");
    assert.equal($.render("{x.y.z}", {}), "");
  });

  it('Can be set to not escape', function(){
    var template = '{x}'
    ,   data = {x: '<script>test</script>'}
    ;
    assert.equal($.render(template, data, false), '<script>test</script>');
  });

  it('Can be passed a custom escape function', function(){
    var template = '{x}'
    ,   data = {x: 'custom-replace-function'}
    ,   escape_fn = function(text){ return text.replace(/-/g, '!')}
    ;
    assert.equal($.render(template, data, escape_fn), 'custom!replace!function');
  });

});
