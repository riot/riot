import { tmpl } from 'riot-tmpl'
import { isBlank } from './../common/util/check'
import { setAttr, remAttr } from './../common/util/dom'

import {
  getImmediateCustomParentTag,
  arrayishAdd,
  arrayishRemove
} from './../common/util/tags'

export default {
  init(dom, parent, attrName, attrValue) {
    this.dom = dom
    this.attr = attrName
    this.rawValue = attrValue
    this.parent = parent
    this.hasExp = tmpl.hasExpr(attrValue)
    return this
  },
  update() {
    const old = this.value
    const customParent = this.parent && getImmediateCustomParentTag(this.parent)
    // if the referenced element is a custom tag, then we set the tag itself, rather than DOM
    const tagOrDom = this.tag || this.dom

    this.value = this.hasExp ? tmpl(this.rawValue, this.parent) : this.rawValue

    // the name changed, so we need to remove it from the old key (if present)
    if (!isBlank(old) && customParent) arrayishRemove(customParent.refs, old, tagOrDom)

    if (isBlank(this.value)) {
      // if the value is blank, we remove it
      remAttr(this.dom, this.attr)
    } else {
      // add it to the refs of parent tag (this behavior was changed >=3.0)
      if (customParent) arrayishAdd(
        customParent.refs,
        this.value,
        tagOrDom,
        // use an array if it's a looped node and the ref is not an expression
        null,
        this.parent.__.index
      )
      // set the actual DOM attr
      setAttr(this.dom, this.attr, this.value)
    }
  },
  unmount() {
    var tagOrDom = this.tag || this.dom
    var customParent = this.parent && getImmediateCustomParentTag(this.parent)
    if (!isBlank(this.value) && customParent)
      arrayishRemove(customParent.refs, this.value, tagOrDom)
    delete this.dom
    delete this.parent
  }
}