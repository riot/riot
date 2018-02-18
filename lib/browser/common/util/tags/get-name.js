import { IS_DIRECTIVE } from './../../global-variables'
import { tmpl } from 'riot-tmpl'
import get from './get'
import getAttribute from '../dom/get-attribute'
/**
 * Get the tag name of any DOM node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { Boolean } skipDataIs - hack to ignore the data-is attribute when attaching to parent
 * @returns { String } name to identify this dom node in riot
 */
export default function getName(dom, skipDataIs) {
  const child = get(dom)
  const namedTag = !skipDataIs && getAttribute(dom, IS_DIRECTIVE)
  return namedTag && !tmpl.hasExpr(namedTag) ?
    namedTag : child ? child.name : dom.tagName.toLowerCase()
}