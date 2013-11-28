global.$ = require("../riot");

[
  "test",
  "observable_test",
  "render_test"
].forEach(function(file){
  require("./" + file + ".js")
});
