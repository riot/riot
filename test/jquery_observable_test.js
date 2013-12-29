
describe("Observable (with jQuery)", function() {

  if (typeof $ !== 'function') return;

  var el = $.observable({});

  it("supports namespaces", function() {
    var counter = 0;

    el.on('name.space1.space2', function(arg) {
      assert.equal(arg, true);
      counter += 1;
    });

    el.trigger('name', true);
    assert.equal(counter, 1);

    el.off('name.space1');

    el.trigger('name', true);
    assert.equal(counter, 1);
  });

});
