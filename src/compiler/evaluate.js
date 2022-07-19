// evaluates a compiled tag within the global context
export function evaluate(js, url) {
  const node = document.createElement('script')
  const root = document.documentElement

  // make the source available in the "(no domain)" tab
  // of Chrome DevTools, with a .js extension
  if (url) node.text = `${js}\n//# sourceURL=${url}.js`

  root.appendChild(node)
  root.removeChild(node)
}
