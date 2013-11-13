
var $ = require("../riot"),
  el = $.observable({}),
  count = 0;


el.one("a", function() {
  count++;
})

el.on("a b c", function() {
  count++;
})

el.trigger("a").trigger("b").trigger("c");

if (count !== 4) throw "Observable error"
else console.info("OK")