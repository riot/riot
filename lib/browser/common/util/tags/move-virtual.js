import createFragment from '../dom/create-fragment'
/**
 * Move virtual tag and all child nodes
 * @this Tag
 * @param { Node } src  - the node that will do the inserting
 * @param { Tag } target - insert before this tag's first child
 */
export default function moveVirtual(src, target) {
  let el = this.__.head
  let sib
  const frag = createFragment()

  while (el) {
    sib = el.nextSibling
    frag.appendChild(el)
    el = sib
    if (el === this.__.tail) {
      frag.appendChild(el)
      src.insertBefore(frag, target.__.head)
      break
    }
  }
}