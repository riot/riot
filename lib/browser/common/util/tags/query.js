import {
  __TAG_IMPL,
  IS_DIRECTIVE
} from './../../global-variables'

/**
 * Get selectors for tags
 * @param   { Array } tags - tag names to select
 * @returns { String } selector
 */
export default function query(tags) {
  // select all tags
  if (!tags) {
    const keys = Object.keys(__TAG_IMPL)
    return keys + query(keys)
  }

  return tags
    .filter(t => !/[^-\w]/.test(t))
    .reduce((list, t) => {
      const name = t.trim().toLowerCase()
      return list + `,[${IS_DIRECTIVE}="${name}"]`
    }, '')
}