import IfExpr from '../../../tag/if'
import create from '../misc/object-create'

/**
 * Create a new if directive
 * @param   { HTMLElement } dom - if root dom node
 * @param   { Tag } context - tag instance where the DOM node is located
 * @param   { String } attr - if expression
 * @returns { IFExpr } a new IfExpr object
 */
export default function createIfDirective(dom, tag, attr) {
  return create(IfExpr).init(dom, tag, attr)
}