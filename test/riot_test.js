describe("$.render", function(){
  it("renders the correct templates", function(){
    assertRender("<div>hi</div>", {}, "<div>hi</div>");
    assertRender("<div>{name}</div>", {name: "Eden"}, "<div>Eden</div>");
  });

  function assertRender(template, data, expected) {
    var result = $.render(template, data)
      , details = "Expected ["+ expected +"]; Got ["+ result + "]; ";

    assert(expected === result, details)
  }
});

describe("$.el", function(){
  it("wraps the template in a jQuery object", function(){
    assertEl("<div>hi</div>", {}, $("<div>hi</div>"));
    assertEl("<div>hi</div>", null, $("<div>hi</div>"));
    assertEl("<div>{name}</div>", {name: "Eden"}, $("<div>Eden</div>"));
  });

  function assertEl(template, data, expected) {
    var result = $.el(template, data)
      , details = "Expected ["+ expected +"]; Got ["+ result + "]; ";

    assert(expected.html() === result.html(), details)
  }
});
