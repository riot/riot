describe("$.presenter", function() {
  // Creates a reusable presenter
  $.present("content-changer", function(element, options) {
    // set some default options
    options = $.extend(true, {
      content: "i am default",
    }, options);

    element.on("click", function(e) {
      $(this).text(options.content);
    });
  });

  it("updates the content on click", function(){
    tag = $("<div>some content</div>").present("content-changer");
    assert.equal(tag.text(), "some content")
    tag.click();
    assert.equal(tag.text(), "i am default")
  });

  it("customises the presenter options", function(){
    tag = $("<div>some content</div>").present("content-changer", {
      content: "I can be anything!!!"
    });
    tag.click();
    assert.equal(tag.text(), "I can be anything!!!")
  });
});
