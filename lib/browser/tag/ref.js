import { tmpl } from 'riot-tmpl'
import { isBlank } from './../common/util/check'
import { remAttr } from './../common/util/dom'

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
    if (!isBlank(this.value)) {
      // add it to the refs of parent tag (this behavior was changed >=3.0)
      if (customParent) arrayishAdd(
        customParent.refs,
        this.value,
        tagOrDom,
        // use an array if it's a looped node and the ref is not an expression
        null,
        this.parent.__.index
      )
    }

    // if it's the first time we pass here let's remove the ref attribute
    // #2329
    if (!old) remAttr(this.dom, this.attr)
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