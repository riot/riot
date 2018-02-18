import getName from './get-name'
import getImmediateCustomParent from './get-immediate-custom-parent'
import arrayishAdd from './arrayish-add'
import define from '../misc/define'
import createTag from './../../../tag/tag'

/**
 * Create a new child tag including it correctly into its parent
 * @param   { Object } child - child tag implementation
 * @param   { Object } opts - tag options containing the DOM node where the tag will be mounted
 * @param   { String } innerHTML - inner html of the child node
 * @param   { Object } parent - instance of the parent tag including the child custom tag
 * @returns { Object } instance of the new child tag just created
 */
export default function initChild(child, opts, innerHTML, parent) {
  const tag = createTag(child, opts, innerHTML)
  const tagName = opts.tagName || getName(opts.root, true)
  const ptag = getImmediateCustomParent(parent)
  // fix for the parent attribute in the looped elements
  define(tag, 'parent', ptag)
  // store the real parent tag
  // in some cases this could be different from the custom parent tag
  // for example in nested loops
  tag.__.parent = parent

  // add this tag to the custom parent tag
  arrayishAdd(ptag.tags, tagName, tag)

  // and also to the real parent tag
  if (ptag !== parent)
    arrayishAdd(parent.tags, tagName, tag)

  return tag
}