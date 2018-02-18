import createFragment from '../dom/create-fragment'
import makeVirtual from './make-virtual'
/**
 * makes a tag virtual and replaces a reference in the dom
 * @this Tag
 * @param { tag } the tag to make virtual
 * @param { ref } the dom reference location
 */
export default function makeReplaceVirtual(tag, ref) {
  const frag = createFragment()
  makeVirtual.call(tag, frag)
  ref.parentNode.replaceChild(frag, ref)
}
