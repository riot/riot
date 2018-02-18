import extend from '../misc/extend'
/**
 * Return a temporary context containing also the parent properties
 * @this Tag
 * @param { Tag } - temporary tag context containing all the parent properties
 */
export default function inheritParentProps() {
  if (this.parent) return extend(Object.create(this), this.parent)
  return this
}