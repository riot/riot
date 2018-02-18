import define from '../misc/define'

/**
 * Manage the mount state of a tag triggering also the observable events
 * @this Tag
 * @param { Boolean } value - ..of the isMounted flag
 */
export default function setMountState(value) {
  const { isAnonymous } = this.__

  define(this, 'isMounted', value)

  if (!isAnonymous) {
    if (value) this.trigger('mount')
    else {
      this.trigger('unmount')
      this.off('*')
      this.__.wasCreated = false
    }
  }
}