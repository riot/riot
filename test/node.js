global.riot = require("../riot");

[
  "../bdd",
  "observable_test",
  "render_test"
].forEach(function(file){
  require("./" + file + ".js");

});
