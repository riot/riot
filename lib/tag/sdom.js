var simpleDom = require('simple-dom')
var simpleTokenizer = require('simple-html-tokenizer')

module.exports = {
  createDocument: function() {
    return new simpleDom.Document()
  },
  parse: function(html) {
    var blank = this.createDocument()
    var parser = new simpleDom.HTMLParser(simpleTokenizer.tokenize, blank, simpleDom.voidMap)
    return parser.parse(html)
  },
  serialize: function(doc) {
    var serializer = new simpleDom.HTMLSerializer(simpleDom.voidMap)
    return serializer.serialize(doc)
  }
}
