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
    this.firstRun = true

    return this
  },
  update() {
    var value = this.rawValue
    if (this.hasExp)
      value = tmpl(this.rawValue, this.parent)

    // if nothing changed, we're done
    if (!this.firstRun && value === this.value) return

    var customParent = this.parent && getImmediateCustomParentTag(this.parent)

    // if the referenced element is a custom tag, then we set the tag itself, rather than DOM
    var tagOrDom = this.tag || this.dom

    // the name changed, so we need to remove it from the old key (if present)
    if (!isBlank(this.value) && customParent)
      arrayishRemove(customParent.refs, this.value, tagOrDom)

    if (isBlank(value)) {
      // if the value is blank, we remove it
      remAttr(this.dom, this.attr)
    } else {
      // add it to the refs of parent tag (this behavior was changed >=3.0)
      if (customParent) arrayishAdd(customParent.refs, value, tagOrDom)
      // set the actual DOM attr
      setAttr(this.dom, this.attr, value)
    }
    this.value = value
    this.firstRun = false
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