/**
 * Walk down recursively all the children tags starting dom node
 * @param   { Object }   dom - starting node where we will start the recursion
 * @param   { Function } fn - callback to transform the child node just found
 * @param   { Object }   context - fn can optionally return an object, which is passed to children
 */
export default function walkNodes(dom, fn, context) {
  if (dom) {
    const res = fn(dom, context)
    let next
    // stop the recursion
    if (res === false) return

    dom = dom.firstChild

    while (dom) {
      next = dom.nextSibling
      walkNodes(dom, fn, res)
      dom = next
    }
  }
}