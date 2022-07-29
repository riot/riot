import * as compiler from '@riotjs/compiler/dist/compiler.essential.esm'

export * from './api/register'
export * from './api/unregister'
export * from './api/unmount'
export * from './api/install'
export * from './api/uninstall'
export * from './api/pure'
export * from './api/with-types'
export * from './api/version'
export * from './api/__'
export * from './compiler/compile'

// enhance the riot mount and component methods
// evaluating the slots from the mounted DOM node
export * from './compiler/mount-with-slots'
export * from './compiler/component-with-slots'

export * from './compiler/inject'
export * from './compiler/compile-from-url'
export * from './compiler/compile-from-string'

export {compiler}

