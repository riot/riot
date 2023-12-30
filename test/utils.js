export function fireEvent(el, name) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(name, false, true)
  el.dispatchEvent(e)
}

export function normalizeInnerHTML(string) {
  return string.replace(/\n/g, '').trim()
}

export const getBaseUrl = () => 'http://localhost:3000'
