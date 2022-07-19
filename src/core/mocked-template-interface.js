import {PURE_COMPONENT_API} from './pure-component-api'
import {noop} from '@riotjs/util/functions'


export const MOCKED_TEMPLATE_INTERFACE = {
  ...PURE_COMPONENT_API,
  clone: noop,
  createDOM: noop
}
