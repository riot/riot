import RefExpr from '../../../tag/ref'
import create from '../misc/object-create'

/**
 * Create a new ref directive
 * @param   { HTMLElement } dom - dom node having the ref attribute
 * @param   { Tag } context - tag instance where the DOM node is located
 * @param   { String } attrName - either 'ref' or 'data-ref'
 * @param   { String } attrValue - value of the ref attribute
 * @returns { RefExpr } a new RefExpr object
 */
export default function createRefDirective(dom, tag, attrName, attrValue) {
  return create(RefExpr).init(dom, tag, attrName, attrValue)
}