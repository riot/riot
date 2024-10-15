import {
  noop,
  removeChild,
  cleanNode,
  UNMOUNT_METHOD_KEY,
  MOUNT_METHOD_KEY,
  UPDATE_METHOD_KEY,
} from '@riotjs/util'

// Components without template use a mocked template interface with some basic functionalities to
// guarantee consistent rendering behaviour see https://github.com/riot/riot/issues/2984
export const MOCKED_TEMPLATE_INTERFACE = {
  [MOUNT_METHOD_KEY](el) {
    this.el = el
  },
  [UPDATE_METHOD_KEY]: noop,
  [UNMOUNT_METHOD_KEY](_, __, mustRemoveRoot = false) {
    if (mustRemoveRoot) removeChild(this.el)
    else if (!mustRemoveRoot) cleanNode(this.el)
  },
  clone() {
    return {...this}
  },
  createDOM: noop,
}
