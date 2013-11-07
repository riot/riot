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

})