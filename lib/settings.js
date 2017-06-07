import { extend }from './browser/common/util/misc'
import { brackets } from 'riot-tmpl'

export default extend(Object.create(brackets.settings), {
  skipAnonymousTags: true,
  // handle the auto updates on any DOM event
  autoUpdate: true
})