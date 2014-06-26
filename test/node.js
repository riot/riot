global.riot = require("../riot");

[
  "../bdd",
  "./lib/route_test",
  "./lib/observable_test",
  "./lib/render_test"
].forEach(function(file){
  require("./" + file + ".js");

});
