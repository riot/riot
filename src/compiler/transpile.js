// cheap module transpilation
export function transpile(code) {
  return `(function (global){${code}})(this)`.replace(
    'export default',
    'return',
  )
}
