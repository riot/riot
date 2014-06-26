describe("#route", function() {
  it("set routes", function() {
    riot.route("a", 1);
    riot.route({b: 2, c: 3});

    assert.deepEqual(riot.route.map, {a: 1, b: 2, c: 3})
  });

  it("matches a route", function() {
    assertRoute("/home", "/home");
    assertRoute("/items/{item}", "/items/debby");
    assertRoute("/items/{item}", "#/items/debby");
    assertRoute("/items/{item}", "#!/items/debby");
    assertRoute(".*/items", "/hi/items");
    assertRoute(".*/items", "/some/regex/items");
    assertRoute(".*/items", "/items");
  });

  it("can use the old route", function() {
    var count = 0, routes = [];
    riot.route(function(path){ count++; routes.push(path) });
    riot.route(function(path){ count++ });
    riot.route(function(path){ count++ });

    riot.route("/any_randow_route") && assert.equal(count, 3);
    riot.route("/other_randow_route") && assert.equal(count, 6);
    assert.deepEqual(routes, ["/any_randow_route", "/other_randow_route"])
  });

  it("matches the params", function() {
    assertRoute("/items?search={q}", "/items?search=hi",
      {path: "/items?search=hi", q: "hi"});

    assertRoute("/items/{item}/{id}", "/items/debby/2",
      {path: "/items/debby/2", item: "debby", id: "2"});

    assertRoute(".*/{item}/{id}", "/my/crazy/cart/debby/2",
      {path: "/my/crazy/cart/debby/2", item: "debby", id: "2"});
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
