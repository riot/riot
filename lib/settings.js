import { extend }from './browser/common/util/misc'
import { brackets } from 'riot-tmpl'

export default extend(Object.create(brackets.settings), {
  skipAnonymousTags: true
})