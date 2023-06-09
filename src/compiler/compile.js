import $ from 'bianco.query'
import { compileFromUrl } from './compile-from-url.js'
import { get as getAttr } from 'bianco.attr'
import { inject } from './inject.js'

export async function compile(options) {
  const scripts = $('script[type="riot"]')
  const urls = scripts.map((s) => getAttr(s, 'src') || getAttr(s, 'data-src'))
  const tags = await Promise.all(
    urls.map((url) => compileFromUrl(url, options)),
  )

  tags.forEach(({ code, meta }, i) => {
    const url = urls[i]
    const { tagName } = meta

    inject(code, tagName, url)
  })
}
