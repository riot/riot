describe("#route", function() {
  it("set routes", function() {
    riot.route("a", 1);
    riot.route({b: 2, c: 3});

    assert.deepEqual(riot.route.map, {a: 1, b: 2, c: 3})
  });

  it("matches a route", function() {
    assertRoute("/home", "/home");
    assertRoute("/items/{item}", "/items/debby");
    assertRoute("/items/{item}/{id}", "/items/debby/2", {
      path: "/items/debby/2", item: "debby", id: "2"});
    assertRoute("/items?search={q}", "/items?search=ddd");
  });

  function assertRoute(route, path, params) {
    var received = false;
    riot.route(route, function(p) {
      received = true
      params && assert.deepEqual(p, params)
    });

    riot.route(path);
    assert(received, "Invalid route to => " + path);
  }

});
