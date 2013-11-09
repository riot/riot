
for (var i = 0; i < 2; i++) {

  describe((i ? "Standalone " : "$.") + "observable", function() {

    var el = i ? observable({}) : $.observable({});

    it("Single listener", function() {

      el.on("a", function(arg) {
        assert.equal(arg, true)
      });

      el.trigger("a", true);

    })

    it("Multiple listeners", function() {

      var count = 0;

      el.on("b c d", function(e) {
        if (++count == 3) assert.equal(e, "d")
      })

      el.one("d", function(a) {
        assert.equal(a, true)
      })

      el.trigger("b").trigger("c").trigger("d", true);

    })

    it("One", function() {

      var counter = 0;

      el.one("g", function() {
        assert.equal(++counter, 1);
      })

      el.trigger("g").trigger("g");
    })


    it("Remove listeners", function() {

      var counter = 0;

      function r() {
        assert.equal(++counter, 1);
      }

      el.on("r", r).on("s", r).off("s", r).trigger("r").trigger("s");

    })

    it("Remove multiple listeners", function() {

      var counter = 0;

      function fn() {
        counter++;
      }

      el.on("a1 b1", fn).on("c1", fn).off("a1 b1").off("c1").trigger("a1").trigger("b1").trigger("c1");

      assert.equal(counter, 0);

    })


    it("Multiple arguments", function() {

      el.on("j", function(a, b) {
        assert.equal(a, 1);
        assert.equal(b[0], 2);
      })

      el.trigger("j", 1, [2]);

    })

  })

}
