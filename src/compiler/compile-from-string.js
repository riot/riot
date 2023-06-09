import * as compiler from '@riotjs/compiler/dist/compiler.essential.esm.js'

export function compileFromString(string, options) {
  return compiler.compile(string, options)
}
