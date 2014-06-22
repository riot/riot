describe("#route", function() {
  it("set routes", function() {
    riot.route("a", 1);
    riot.route({b: 2, c: 3});

    assert.deepEqual(riot.route.map, {a: 1, b: 2, c: 3})
  });

  it("matches a route", function() {
    assertRoute("/home", "/home");
//    assertRoute("/items/{item}", "/items/debby");
  });

  function assertRoute(route, path) {
    var received = false;
    riot.route(route, function() { received = true });
    riot.route(path);
    assert(received);
  }

});
