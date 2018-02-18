/**
 * Loop backward all the parents tree to detect the first custom parent tag
 * @param   { Object } tag - a Tag instance
 * @returns { Object } the instance of the first custom parent tag found
 */
export default function getImmediateCustomParent(tag) {
  let ptag = tag
  while (ptag.__.isAnonymous) {
    if (!ptag.parent) break
    ptag = ptag.parent
  }
  return ptag
}