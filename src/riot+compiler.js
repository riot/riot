import * as riot from './riot'
import {$$,getAttribute} from './utils/dom'
import {camelCase, kebabCase} from './utils/misc'
import {compile as compiler, registerPostprocessor} from '@riotjs/compiler'

const GLOBAL_REGISTRY = '__riot_registry__'
const TMP_TAG_NAME_VARIABLE = '__CURRENT_RIOT_TAG_NAME__'
window[GLOBAL_REGISTRY] = {}

// evaluates a compiled tag within the global context
function globalEval(js, url) {
  const node = document.createElement('script')
  const root = document.documentElement

  // make the source available in the "(no domain)" tab
  // of Chrome DevTools, with a .js extension
  if (url) js += `\n//# sourceURL=${url}.js`

  node.text = js
  root.appendChild(node)
  root.removeChild(node)
}

registerPostprocessor(async function(code, { tagName }){
  // cheap transpilation
  return {
    code: `${TMP_TAG_NAME_VARIABLE}=${tagName};(function (global){${code}})(window)`
      .replace('export default',
        `global['${GLOBAL_REGISTRY}']['${camelCase(tagName)}'] =`
      ),
    map: {}
  }
})

async function compileFromUrl(url) {
  const response = await fetch(url)
  const code = await response.text()

  return await compiler(code, { file: url })
}

async function compileFromString(string, options) {
  return await compiler(string, options)
}

async function compile() {
  const scripts = $$('script[type="riot"]')
  const urls = scripts.map(s => getAttribute(s, 'src') || getAttribute(s, 'data-src'))
  const tags = await Promise.all(urls.map(compileFromUrl))

  tags.forEach(({code}, i) => {
    const url = urls[i]
    const tagNameRe = new RegExp(`${TMP_TAG_NAME_VARIABLE}=((.*?);)`)
    const tagName = tagNameRe.exec(code)[1]

    globalEval(code.replace(tagNameRe, ''), url)
    riot.register(kebabCase(tagName), window[GLOBAL_REGISTRY][camelCase(tagName)])
  })
}

export default {
  ...riot,
  compile,
  compileFromString,
  compileFromUrl
}

