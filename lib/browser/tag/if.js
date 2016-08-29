import { remAttr } from './../common/util/dom'
import { unmountAll } from './../common/util/tags'
import { tmpl } from 'riot-tmpl'
import { parseExpressions } from './parse'
import update from './update'

export default {
  init(dom, parentTag, expr) {
    remAttr(dom, 'if')
    this.parentTag = parentTag
    this.expr = expr
    this.stub = document.createTextNode('')
    this.pristine = dom

    var p = dom.parentNode
    p.insertBefore(this.stub, dom)
    p.removeChild(dom)

    return this
  },
  update() {
    var newValue = tmpl(this.expr, this.parentTag)

    if (newValue && !this.current) { // insert
      this.current = this.pristine.cloneNode(true)
      this.stub.parentNode.insertBefore(this.current, this.stub)

      this.expressions = []
      parseExpressions(this.current, this.parentTag, this.expressions, true)
    }

    else if (!newValue && this.current) { // remove
      unmountAll(this.expressions)
      this.current.parentNode.removeChild(this.current)
      this.current = null
      this.expressions = []
    }

    if (newValue) update(this.expressions, this.parentTag)
  },
  unmount() {
    unmountAll(this.expressions || [])
    delete this.pristine
    delete this.parentNode
    delete this.stub
  }
}