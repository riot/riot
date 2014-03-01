
describe("Observable", function() {

  var el = $.observable({}),
    total = 11,
    count = 0;

  it("Single listener", function() {

    el.on("a", function(evt, arg) {
      assert.equal(arg, true);
      count++;
    });

    el.trigger("a", true);
  });

  it("Multiple listeners", function() {

    var counter = 0;

    // try with special characters on event name
    el.on("b/4 c-d d:x", function(evt, arg) {
      counter++;
      if (counter == 1) assert.equal(evt.type, "b/4");
      if (counter == 2) assert.equal(evt.type, "c-d");
      if (counter == 3) assert.equal(evt.type, "d:x");
      count++;
    });

    el.one("d:x", function(evt, a) {
      assert.equal(a, true);
      count++;
    });

    el.trigger("b/4").trigger("c-d").trigger("d:x", true);

  });

  it("One", function() {

    var counter = 0;

    el.one("g", function() {
      assert.equal(++counter, 1);
      count++;
    });

    el.trigger("g").trigger("g");
  });

  it("One & on", function() {

    var counter = 0;

    el.one("y", function() {
      count++;
      counter++;

    }).on("y", function() {
      count++;
      counter++;

    }).trigger("y").trigger("y");

    assert.equal(counter, 3);

  });


  it("Remove listeners", function() {

    var counter = 0;

    function r() {
      assert.equal(++counter, 1);
      count++;
    }

    el.on("r", r).on("s", r).off("s", r).trigger("r").trigger("s");

  });

  it("Remove multiple listeners", function() {

    var counter = 0;

    function fn() {
      counter++;
    }

    el.on("a1 b1", fn).on("c1", fn).off("a1 b1").off("c1").trigger("a1").trigger("b1").trigger("c1");

    assert.equal(counter, 0);

  });

  it("does not call trigger infinitely", function() {
    var counter = 0,
      otherEl = $.observable({});

    el.on("update", function(evt, value) {
      if (counter++ < 1) { // 2 calls are enough to know the test failed
        otherEl.trigger("update", value);
      }
    });

    otherEl.on("update", function(evt, value) {
      el.trigger("update", value);
    });

    el.trigger("update", "foo");

    assert.equal(1, counter);
  });

  it("is able to trigger events inside a listener", function() {
    var e2 = false;

    el.on("e1", function() { this.trigger("e2"); });
    el.on("e1", function() { e2 = true; });

    el.trigger("e1");

    assert(e2);
  });


  it("Multiple arguments", function() {

    el.on("j", function(evt, a, b) {
      assert.equal(a, 1);
      assert.equal(b[0], 2);
      count++;
    });

    el.trigger("j", 1, [2]);

  });

  it("Remove all listeners", function() {

    var counter = 0;

    function fn() {
      counter++;
    }

    el.on("aa", fn).on("aa", fn).on("bb", fn);
    el.off("*")

    el.trigger("aa").trigger("bb");

    assert.equal(counter, 0);

  });

  assert.equal(total, count);

});
