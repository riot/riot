
describe("Observable", function() {

  var el = $.observable({}),
    total = 11,
    count = 0;

  it("adds several methods to the given object", function() {
    assert.equal(typeof el.on, 'function');
    assert.equal(typeof el.one, 'function');
    assert.equal(typeof el.off, 'function');
    assert.equal(typeof el.trigger, 'function');
  });

  it("Single listener", function() {

    el.on("a", function(arg) {
      assert.equal(arg, true);
      count++;
    });

    el.trigger("a", true);
  });

  it("Multiple listeners", function() {

    var counter = 0;

    // try with special characters on event name
    el.on("b/4 c-d d:x", function(e) {
      if (++counter == 3) assert.equal(e, "d:x");
      count++;
    });

    el.one("d:x", function(a) {
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


  it("Multiple arguments", function() {

    el.on("j", function(a, b) {
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
