
/*
  Compilation for the browser
*/
riot.compile = (function () {

  var
    doc = window.document,
    promise,
    ready

  function GET(url, fn, opts) {
    var req = new XMLHttpRequest()

    req.onreadystatechange = function() {
      if (req.readyState === 4 &&
         (req.status === 200 || !req.status && req.responseText.length))
        fn(req.responseText, opts, url)
    }
    req.open('GET', url, true)
    req.send('')
  }

  function unindent(src, dbg) {
    var indent = src.match(/^([ \t]*)</m) // only before first tag
    return indent && indent[1] ? src.replace(new RegExp('^' + indent[1], 'gm'), '') : src
  }

  function globalEval(js, opts, comp) {
    var
      node = doc.createElement('script'),
      root = doc.documentElement

    node.text = js
    root.appendChild(node)
    root.removeChild(node)
  }

  function compileScripts(fn) {
    var
      scripts = doc.querySelectorAll('script[type="riot/tag"]'),
      scriptsAmount = scripts.length

    function done() {
      promise.trigger('ready')
      ready = true
      if (fn) fn()
    }

    function compileTag(src, opts, url) {
      globalEval(compile(src, opts, url))
      if (!--scriptsAmount) done()
    }

    if (!scriptsAmount) done()
    else {
      for (var i = 0; i < scripts.length; ++i) {
        var
          script = scripts[i],
          opts = {template: script.getAttribute('template')},
          url = script.getAttribute('src')

        url ? GET(url, compileTag, opts) : compileTag(unindent(script.innerHTML), opts)
      }
    }
  }

  //// Entry point -----

  return function (arg, fn) {

    if (typeof arg === 'string') {
      // fix in both, compile was called here and in globalEval

      if (/^\s*</.test(arg)) {
        var js = compile(unindent(arg)) // fix: pass unindented src to compile, don't fake test
        if (!fn) globalEval(js)
        return js
      }

      GET(arg, function (str) {
        var js = compile(str, {}, arg)
        globalEval(js)
        if (fn) fn(js, str)
      })

    }
    else {

      // must be a function
      fn = typeof arg !== 'function' ? undefined : arg

      // all compiled
      if (ready)
        return fn && fn()

      // add to queue
      if (promise) {
        if (fn) promise.on('ready', fn)

      // grab riot/tag elements + load & execute them
      } else {
        promise = riot.observable()
        compileScripts(fn)
      }
    }
  }

})()

// reassign mount methods
var mount = riot.mount

riot.mount = function(a, b, c) {
  var ret
  riot.compile(function() { ret = mount(a, b, c) })
  return ret
}
