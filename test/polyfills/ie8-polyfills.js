var ie8innerhtml = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')
document.head = document.getElementsByTagName('head')[0]

Object.defineProperty(Element.prototype, 'innerHTML', {
  get: function() {
    if(this.nodeName == 'STYLE') {
      return this.styleSheet.cssText
    }
    return ie8innerhtml.get.call(this)
  },
  set: function(val) {
    if(this.nodeName == 'STYLE') {
      this.styleSheet.cssText = val
    } else {
      ie8innerhtml.set.call(this, val)
    }

  }
});

var ie8create = document.createElement

document.createElement = function(el) {
  var elem = ie8create(el)
  if(el.toLowerCase() == 'style') {
    elem.setAttribute('type', 'text/css')
  }
  return elem
}
