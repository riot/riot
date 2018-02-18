import extend from './browser/common/util/misc/extend'
import create from './browser/common/util/misc/object-create'
import { brackets } from 'riot-tmpl'

export default extend(create(brackets.settings), {
  skipAnonymousTags: true,
  // handle the auto updates on any DOM event
  autoUpdate: true
})