// eslint-disable-next-line import/no-unresolved
import * as compiler from '@riotjs/compiler/essential'

export * from './api/register.js'
export * from './api/unregister.js'
export * from './api/unmount.js'
export * from './api/install.js'
export * from './api/uninstall.js'
export * from './api/pure.js'
export * from './api/with-types.js'
export * from './api/version.js'
export * from './api/__.js'
export * from './compiler/compile.js'

// enhance the riot mount and component methods
// evaluating the slots from the mounted DOM node
export * from './compiler/mount-with-slots.js'
export * from './compiler/component-with-slots.js'

export * from './compiler/inject.js'
export * from './compiler/compile-from-url.js'
export * from './compiler/compile-from-string.js'

export { compiler }
