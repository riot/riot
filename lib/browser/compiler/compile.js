
/*
  Compilation for the browser
*/
riot.compile = (function () {

  var
    promise,    // emits the 'ready' event and runs the first callback
    ready       // all the scripts were compiled?

  // gets the source of an external tag with an async call
  function GET (url, fn, opts) {
    var req = new XMLHttpRequest()

    req.onreadystatechange = function () {
      if (req.readyState === 4 &&
         (req.status === 200 || !req.status && req.responseText.length)) {
        fn(req.responseText, opts, url)
      }
    }
    req.open('GET', url, true)
    req.send('')
  }

  // evaluates a compiled tag within the global context
  function globalEval (js, url) {
    if (typeof js === T_STRING) {
      var
        node = mkEl('script'),
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
      var code = compile(src, opts, url)

      globalEval(code, url)
      if (!--scriptsAmount) done()
    }

    if (!scriptsAmount) done()
    else {
      for (var i = 0; i < scripts.length; ++i) {
        var
          script = scripts[i],
          opts = extend({template: getAttr(script, 'template')}, xopt),
          url = getAttr(script, 'src')

        url ? GET(url, compileTag, opts) : compileTag(script.innerHTML, opts)
      }
    }
  }

  //// Entry point -----

  return function (arg, fn, opts) {

    if (typeof arg === T_STRING) {

      // 2nd parameter is optional, but can be null
      if (isObject(fn)) {
        opts = fn
        fn = false
      }

      // `riot.compile(tag [, callback | true][, options])`
      if (/^\s*</m.test(arg)) {
        var js = compile(arg, opts)
        if (fn !== true) globalEval(js)
        if (isFunction(fn)) fn(js, arg, opts)
        return js
      }

      // `riot.compile(url [, callback][, options])`
      GET(arg, function (str, opts, url) {
        var js = compile(str, opts, url)
        globalEval(js, url)
        if (fn) fn(js, str, opts)
      })

    }
    else {

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
        promise = riot.observable()
        compileScripts(fn, opts)
      }
    }
  }

})()

// reassign mount methods -----
var mount = riot.mount

riot.mount = function (a, b, c) {
  var ret
  riot.compile(function () { ret = mount(a, b, c) })
  return ret
}
