riot.parsers = {
  html: {},
  js: {
    coffee: function(js) {
      return CoffeeScript.compile(js, { bare: true })
    },
    es6: function(js) {
      return babel.transform(js, { blacklist: ['useStrict'] }).code
    },
    plainjs: function(js) {
      return js
    }
  }
}


