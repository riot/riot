const isBrowser = typeof process === 'undefined'

/* c8 ignore start */
const evaluateWithScriptInjection = (code, url) => {
  const node = document.createElement('script')
  const root = document.documentElement
  // make the source available in the "(no domain)" tab
  // of Chrome DevTools, with a .js extension
  node.text = url ? `${code}\n//# sourceURL=${url}.js` : code

  root.appendChild(node)
  root.removeChild(node)
}
/* c8 ignore end */

// evaluates a compiled tag within the global context
export function evaluate(code, url) {
  // browsers can evaluate the code via script injection and sourcemaps
  /* c8 ignore start */
  if (isBrowser) evaluateWithScriptInjection(code, url)
  /* c8 ignore end */
  // in other environments we rely on a simple Function eval
  else new Function(code)()
}
