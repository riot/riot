/* istanbul ignore next */
var parsers = {
  html: {},
  css: {},
  js: {
    coffee: function(js) {
      return CoffeeScript.compile(js, { bare: true })
    },
    es6: function(js) {
      return babel.transform(js, { blacklist: ['useStrict'] }).code
    },
    none: function(js) {
      return js
    }
  }
}

// fix 913
parsers.js.javascript = parsers.js.none
// 4 the nostalgics
parsers.js.coffeescript = parsers.js.coffee

riot.parsers = parsers


