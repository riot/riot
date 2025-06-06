// eslint-disable-next-line import/no-unresolved
import * as compiler from '@riotjs/compiler/essential'

export async function compileFromUrl(url, options) {
  const response = await fetch(url)

  const code = await response.text()

  return compiler.compile(code, { file: url, ...options })
}
