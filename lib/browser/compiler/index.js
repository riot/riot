import observable from 'riot-observable'
import compiler from 'riot-compiler'
import { T_STRING } from './../common/global-variables'

import isArray from './../common/util/checks/is-array'
import isObject from './../common/util/checks/is-object'
import isFunction from './../common/util/checks/is-function'

import extend from './../common/util/misc/extend'

import $$ from './../common/util/dom/$$'
import getAttribute from './../common/util/dom/get-attribute'
import makeElement from './../common/util/dom/make-element'

var
  promise,    // emits the 'ready' event and runs the first callback
  ready       // all the scripts were compiled?

// gets the source of an external tag with an async call
function GET (url, fn, opts) {
  var req = new XMLHttpRequest()

  req.onreadystatechange = function () {
    if (req.readyState === 4) {
      if (req.status === 200 || !req.status && req.responseText.length) {
        fn(req.responseText, opts, url)
      } else {
        compile.error(`"${ url }" not found`)
      }
    }
  }

  req.onerror = e => compile.error(e)

  req.open('GET', url, true)
  req.send('')
}

// evaluates a compiled tag within the global context
function globalEval (js, url) {
  if (typeof js === T_STRING) {
    var
      node = makeElement('script'),
      root = document.documentElement

    // make the source available in the "(no domain)" tab
    // of Chrome DevTools, with a .js extension
    if (url) js += '\n//# sourceURL=' + url + '.js'

    node.text = js
    root.appendChild(node)
    root.removeChild(node)
  }
}

// compiles all the internal and external tags on the page
function compileScripts (fn, xopt) {
  var
    scripts = $$('script[type="riot/tag"]'),
    scriptsAmount = scripts.length

  function done() {
    promise.trigger('ready')
    ready = true
    if (fn) fn()
  }

  function compileTag (src, opts, url) {
    var code = compiler.compile(src, opts, url)

    globalEval(code, url)
    if (!--scriptsAmount) done()
  }

  if (!scriptsAmount) done()
  else {
    for (var i = 0; i < scripts.length; ++i) {
      var
        script = scripts[i],
        opts = extend({template: getAttribute(script, 'template')}, xopt),
        url = getAttribute(script, 'src') || getAttribute(script, 'data-src')

      url ? GET(url, compileTag, opts) : compileTag(script.innerHTML, opts)
    }
  }
}

export const parsers = compiler.parsers

/*
  Compilation for the browser
*/
export function compile (arg, fn, opts) {

  if (typeof arg === T_STRING) {

    // 2nd parameter is optional, but can be null
    if (isObject(fn)) {
      opts = fn
      fn = false
    }

    // `riot.compile(tag [, callback | true][, options])`
    if (/^\s*</m.test(arg)) {
      var js = compiler.compile(arg, opts)
      if (fn !== true) globalEval(js)
      if (isFunction(fn)) fn(js, arg, opts)
      return js
    }

    // `riot.compile(url [, callback][, options])`
    GET(arg, function (str, opts, url) {
      var js = compiler.compile(str, opts, url)
      globalEval(js, url)
      if (fn) fn(js, str, opts)
    }, opts)

  } else if (isArray(arg)) {
    var i = arg.length
    // `riot.compile([urlsList] [, callback][, options])`
    arg.forEach(function(str) {
      GET(str, function (str, opts, url) {
        var js = compiler.compile(str, opts, url)
        globalEval(js, url)
        i --
        if (!i && fn) fn(js, str, opts)
      }, opts)
    })
  } else {

    // `riot.compile([callback][, options])`
    if (isFunction(arg)) {
      opts = fn
      fn = arg
    } else {
      opts = arg
      fn = undefined
    }

    if (ready) {
      return fn && fn()
    }

    if (promise) {
      if (fn) promise.on('ready', fn)

    } else {
      promise = observable()
      compileScripts(fn, opts)
    }
  }
}

// it can be rewritten by the user to handle all the compiler errors
compile.error = (e) => {
  throw new Error(e)
}
