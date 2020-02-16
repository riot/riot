import * as riot from './riot'
import $ from 'bianco.query'
import compiler from '@riotjs/compiler/dist/compiler'
import {get as getAttr} from 'bianco.attr'

const GLOBAL_REGISTRY = '__riot_registry__'
window[GLOBAL_REGISTRY] = {}

// evaluates a compiled tag within the global context
function evaluate(js, url) {
  const node = document.createElement('script')
  const root = document.documentElement

  // make the source available in the "(no domain)" tab
  // of Chrome DevTools, with a .js extension
  if (url) node.text = `${js}\n//# sourceURL=${url}.js`

  root.appendChild(node)
  root.removeChild(node)
}

// cheap module transpilation
function transpile(code) {
  return `(function (global){${code}})(this)`.replace('export default', 'return')
}

function inject(code, tagName, url) {
  evaluate(`window.${GLOBAL_REGISTRY}['${tagName}'] = ${transpile(code)}`, url)
  riot.register(tagName, window[GLOBAL_REGISTRY][tagName])
}

function compileFromString(string, options) {
  return compiler.compile(string, options)
}

async function compileFromUrl(url, options) {
  const response = await fetch(url)
  const code = await response.text()

  return compiler.compile(code, { file: url, ...options })
}

async function compile(options) {
  const scripts = $('script[type="riot"]')
  const urls = scripts.map(s => getAttr(s, 'src') || getAttr(s, 'data-src'))
  const tags = await Promise.all(urls.map(url => compileFromUrl(url, options)))

  tags.forEach(({code, meta}, i) => {
    const url = urls[i]
    const {tagName} = meta

    inject(code, tagName, url)
  })
}

export default {
  ...riot,
  compile,
  inject,
  compileFromUrl,
  compileFromString,
  compiler
}

