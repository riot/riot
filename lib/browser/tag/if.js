import removeAttribute from './../common/util/dom/remove-attribute'
import createPlacholder from './../common/util/dom/create-placeholder'
import unmountAll from './../common/util/tags/unmount-all'
import extend from './../common/util/misc/extend'
import { tmpl } from 'riot-tmpl'
import { CONDITIONAL_DIRECTIVE } from './../common/global-variables'
import { parseExpressions } from './parse'
import updateAllExpressions from './update'

export default {
  init(dom, tag, expr) {
    removeAttribute(dom, CONDITIONAL_DIRECTIVE)
    extend(this, { tag, expr, stub: createPlacholder(), pristine: dom })
    const p = dom.parentNode
    p.insertBefore(this.stub, dom)
    p.removeChild(dom)

    return this
  },
  update() {
    this.value = tmpl(this.expr, this.tag)

    if (this.value && !this.current) { // insert
      this.current = this.pristine.cloneNode(true)
      this.stub.parentNode.insertBefore(this.current, this.stub)
      this.expressions = parseExpressions.apply(this.tag, [this.current, true])
    } else if (!this.value && this.current) { // remove
      this.unmount()
      this.current = null
      this.expressions = []
    }

    if (this.value) updateAllExpressions.call(this.tag, this.expressions)
  },
  unmount() {
    if (this.current) {
      if (this.current._tag) {
        this.current._tag.unmount()
      } else if (this.current.parentNode) {
        this.current.parentNode.removeChild(this.current)
      }
    }

    unmountAll(this.expressions || [])
  }
}