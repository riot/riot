import {MOUNT_METHOD_KEY, UNMOUNT_METHOD_KEY, UPDATE_METHOD_KEY} from '@riotjs/util/constants'
import {noop} from '@riotjs/util/functions'

export const PURE_COMPONENT_API = Object.freeze({
  [MOUNT_METHOD_KEY]: noop,
  [UPDATE_METHOD_KEY]: noop,
  [UNMOUNT_METHOD_KEY]: noop
})
