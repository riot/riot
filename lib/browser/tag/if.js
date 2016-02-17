
function IfExpr(dom, parentTag, expr) {
  remAttr(dom, 'if')
  this.parentTag = parentTag
  this.expr = expr
  this.stub = document.createTextNode('')
  this.pristine = dom

  var p = dom.parentNode
  if (p) {
    p.insertBefore(this.stub, dom)
    p.removeChild(dom)
  }
}

IfExpr.prototype.isIf = true


IfExpr.prototype.update = function() {
  var newValue = tmpl(this.expr, this.parentTag), p

  if (newValue && !this.current) { // insert
    this.current = this.pristine.cloneNode(true)
    p = this.stub.parentNode

    if (p) p.insertBefore(this.current, this.stub)
    else this.parentTag.root = this.current

    this.expressions = []
    parseExpressions(this.current, this.parentTag, this.expressions, true)
  }

  if (!newValue && this.current) { // remove
    unmountAll(this.expressions)
    this.current.parentNode.removeChild(this.current)
    this.current = null
    this.expressions = []
  }

  if (!newValue && !this.stub.parentNode)
    this.parentTag.stub = this.stub

  if (newValue) update(this.expressions, this.parentTag)
}


IfExpr.prototype.unmount = function() {
  unmountAll(this.expressions || [])
  delete this.pristine
  delete this.parentNode
  delete this.stub
}
