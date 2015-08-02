var parsers = {
  html: {
    jade: function(html) {
      return require('jade').render(html, {pretty: true, doctype: 'html'})
    }
  },
  css: {
    stylus: function(tag, css) {
      stylus = require('stylus')
      try {
        // optional nib support
        return stylus(str).include(require('nib').path).render()
      } catch(e) {
        return stylus.render(css)
      }
    }
  },
  js: {
    none: function(js) {
      return js
    },
    livescript: function(js) {
      return require('livescript').compile(js, { bare: true, header: false })
    },
    typescript: function(js) {
      return require('typescript-simple')(js)
    },
    es6: function(js) {
      return require('babel').transform(js, { blacklist: ['useStrict'] }).code
    },
    coffee: function(js) {
      return require('coffee-script').compile(js, { bare: true })
    }
  }
}

// fix 913
parsers.js.javascript = parsers.js.none
// 4 the nostalgics
parsers.js.coffeescript = parsers.js.coffee

module.exports = parsers
