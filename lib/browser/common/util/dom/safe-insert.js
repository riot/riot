/**
 * Insert safely a tag to fix #1962 #1649
 * @param   { HTMLElement } root - children container
 * @param   { HTMLElement } curr - node to insert
 * @param   { HTMLElement } next - node that should preceed the current node inserted
 */
export default function safeInsert(root, curr, next) {
  root.insertBefore(curr, next.parentNode && next)
}