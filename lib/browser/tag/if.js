import { remAttr, createDOMPlaceholder } from './../common/util/dom'
import { tmpl } from 'riot-tmpl'
import { unmountAll } from './../common/util/tags'
import { CONDITIONAL_DIRECTIVE } from './../common/global-variables'
import { parseExpressions } from './parse'
import updateAllExpressions from './update'

export default {
  init(dom, tag, expr) {
    remAttr(dom, CONDITIONAL_DIRECTIVE)
    this.tag = tag
    this.expr = expr
    this.stub = createDOMPlaceholder()
    this.pristine = dom

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
      unmountAll(this.expressions)
      if (this.current._tag) {
        this.current._tag.unmount()
      } else if (this.current.parentNode) {
        this.current.parentNode.removeChild(this.current)
      }
      this.current = null
      this.expressions = []
    }

    if (this.value) updateAllExpressions.call(this.tag, this.expressions)
  },
  unmount() {
    unmountAll(this.expressions || [])
  }
}