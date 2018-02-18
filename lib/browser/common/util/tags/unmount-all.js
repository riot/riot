import each from '../misc/each'

/**
 * Trigger the unmount method on all the expressions
 * @param   { Array } expressions - DOM expressions
 */
export default function unmountAll(expressions) {
  each(expressions, expr => {
    if (expr.unmount) expr.unmount(true)
    else if (expr.tagName) expr.tag.unmount(true)
    else if (expr.unmount) expr.unmount()
  })
}