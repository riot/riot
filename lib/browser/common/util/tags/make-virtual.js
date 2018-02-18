import createPlaceholder from '../dom/create-placeholder'
import createFragment from '../dom/create-fragment'
/**
 * Adds the elements for a virtual tag
 * @this Tag
 * @param { Node } src - the node that will do the inserting or appending
 * @param { Tag } target - only if inserting, insert before this tag's first child
 */
export default function makeVirtual(src, target) {
  const head = createPlaceholder()
  const tail = createPlaceholder()
  const frag = createFragment()
  let sib
  let el

  this.root.insertBefore(head, this.root.firstChild)
  this.root.appendChild(tail)

  this.__.head = el = head
  this.__.tail = tail

  while (el) {
    sib = el.nextSibling
    frag.appendChild(el)
    this.__.virts.push(el) // hold for unmounting
    el = sib
  }

  if (target)
    src.insertBefore(frag, target.__.head)
  else
    src.appendChild(frag)
}