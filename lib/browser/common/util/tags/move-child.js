import isArray from '../checks/is-array'
import arrayishAdd from './arrayish-add'
/**
 * Move the position of a custom tag in its parent tag
 * @this Tag
 * @param   { String } tagName - key where the tag was stored
 * @param   { Number } newPos - index where the new tag will be stored
 */
export default function moveChild(tagName, newPos) {
  const parent = this.parent
  let tags
  // no parent no move
  if (!parent) return

  tags = parent.tags[tagName]

  if (isArray(tags))
    tags.splice(newPos, 0, tags.splice(tags.indexOf(this), 1)[0])
  else arrayishAdd(parent.tags, tagName, this)
}