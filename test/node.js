global.window = {addEventListener: function(v){ this.listener = v; }};
global.document = {};
global.riot = require("../riot");

[
  "../bdd",
  "route_test",
  "observable_test",
  "render_test"
].forEach(function(file){
  require("./" + file + ".js");

});
