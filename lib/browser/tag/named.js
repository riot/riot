export default function NamedExpr(dom, attrName, attrValue, parent) {
  this.dom = dom
  this.attr = attrName
  this.rawValue = attrValue
  this.parent = parent
  this.customParent = getImmediateCustomParentTag(parent)
  this.hasExp = tmpl.hasExpr(attrValue)
  this.firstRun = true
}


NamedExpr.prototype.update = function() {
  var value = this.rawValue
  if (this.hasExp)
    value = tmpl(this.rawValue, this.parent)

  // if nothing changed, we're done
  if (!this.firstRun && value === this.value) return

  // if the named element is a custom tag, then we set the tag itself, rather than DOM
  var tagOrDom = this.tag || this.dom

  // the name changed, so we need to remove it from the old key (if present)
  if (!isBlank(this.value))
    arrayishRemove(this.customParent, this.value, tagOrDom)

  if (isBlank(value)) {
    // if the value is blank, we remove it
    remAttr(this.dom, this.attr)
  } else {
    // add it to the parent tag, and set the actual DOM attr
    arrayishAdd(this.customParent, value, tagOrDom)
    setAttr(this.dom, this.attr, value)
  }
  this.value = value
  this.firstRun = false
}

NamedExpr.prototype.unmount = function() {
  var tagOrDom = this.tag || this.dom
  if (!isBlank(this.value))
    arrayishRemove(this.customParent, this.value, tagOrDom)
  delete this.dom
  delete this.parent
  delete this.customParent
}
