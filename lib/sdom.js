// simple-dom helper

var simpleDom = require('simple-dom')
var simpleTokenizer = require('simple-html-tokenizer')

// create `document` to make riot work
if (typeof window == 'undefined') {
  document = new simpleDom.Document()
}

// add `innerHTML` property to simple-dom element
Object.defineProperty(simpleDom.Element.prototype, 'innerHTML', {
  set: function(html) {
    var frag = sdom.parse(html)
    this.appendChild(frag)
  }
})

// add `outerHTML` property to simple-dom element
// note: if `util.mkdom` could work with nodes then we won't need this
Object.defineProperty(simpleDom.Element.prototype, 'outerHTML', {
  get: function() {
    return sdom.serialize(this)
  }
})

// add `style` property to simple-dom element
Object.defineProperty(simpleDom.Element.prototype, 'style', {
  get: function() {
    var el = this
    return Object.defineProperty({}, 'display', {
      set: function(value) {
        el.setAttribute('style', 'display: ' + value + ';')
      }
    })
  }
})

var sdom = module.exports = {
  parse: function(html) {
    // parse html string to simple-dom document
    var blank = new simpleDom.Document()
    var parser = new simpleDom.HTMLParser(simpleTokenizer.tokenize, blank, simpleDom.voidMap)
    return parser.parse(html)
  },
  serialize: function(doc) {
    // serialize simple-dom document to html string
    var serializer = new simpleDom.HTMLSerializer(simpleDom.voidMap)
    return serializer.serialize(doc)
  }
}
