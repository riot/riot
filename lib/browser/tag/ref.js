import { tmpl } from 'riot-tmpl'
import isBlank from './../common/util/checks/is-blank'
import isString from './../common/util/checks/is-string'
import removeAttribute from './../common/util/dom/remove-attribute'
import setAttribute from './../common/util/dom/set-attribute'

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
    const tagOrDom = this.dom.__ref || this.tag || this.dom

    this.value = this.hasExp ? tmpl(this.rawValue, this.parent) : this.rawValue

    // the name changed, so we need to remove it from the old key (if present)
    if (!isBlank(old) && customParent) arrayishRemove(customParent.refs, old, tagOrDom)
    if (!isBlank(this.value) && isString(this.value)) {
      // add it to the refs of parent tag (this behavior was changed >=3.0)
      if (customParent) arrayishAdd(
        customParent.refs,
        this.value,
        tagOrDom,
        // use an array if it's a looped node and the ref is not an expression
        null,
        this.parent.__.index
      )

      if (this.value !== old) {
        setAttribute(this.dom, this.attr, this.value)
      }
    } else {
      removeAttribute(this.dom, this.attr)
    }

    // cache the ref bound to this dom node
    // to reuse it in future (see also #2329)
    if (!this.dom.__ref) this.dom.__ref = tagOrDom
  },
  unmount() {
    const tagOrDom = this.tag || this.dom
    const customParent = this.parent && getImmediateCustomParentTag(this.parent)
    if (!isBlank(this.value) && customParent)
      arrayishRemove(customParent.refs, this.value, tagOrDom)
  }
}