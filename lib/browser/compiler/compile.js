
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

  function globalEval(js) {
    var
      node = doc.createElement('script'),
      root = doc.documentElement

    node.text = js
    root.appendChild(node)
    root.removeChild(node)
  }

  function compileScripts(fn, exopt) {
    var
      scripts = doc.querySelectorAll('script[type="riot/tag"]'),
      scriptsAmount = scripts.length

    function done() {
      promise.trigger('ready')
      ready = true
      if (fn) fn()
    }

    function compileTag(src, opts, url) {
      var code = compile(src, opts, url)

      if (url) code += '\n//# sourceURL=' + url + '.js'
      globalEval(code)
      if (!--scriptsAmount) done()
    }

    if (!scriptsAmount) done()
    else {
      for (var i = 0; i < scripts.length; ++i) {
        var
          script = scripts[i],
          opts = {template: script.getAttribute('template')},
          url = script.getAttribute('src')

        if (exopt) opts = extend(opts, exopt)
        url ? GET(url, compileTag, opts) : compileTag(script.innerHTML, opts)
      }
    }
  }

  //// Entry point -----

  return function (arg, fn, opts) {

    if (typeof arg === 'string') {

      if (typeof fn === 'object') {
        opts = fn
        fn = false
      }

      if (/^\s*</.test(arg)) {

        // `riot.compile(tag [, true][, options])`
        var js = compile(arg, opts)
        if (!fn) globalEval(js)
        return js
      }

      // `riot.compile(url [, callback][, options])`
      GET(arg, function (str) {
        var js = compile(str, opts, arg)
        globalEval(js)
        if (fn) fn(js, str)
      })

    }
    else {

      // `riot.compile([callback][, options])`

      if (typeof arg === 'function') {
        opts = fn
        fn = arg
      }
      else {
        opts = arg
        fn = undefined
      }

      if (ready)
        return fn && fn()

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

riot.mount = function(a, b, c) {
  var ret
  riot.compile(function() { ret = mount(a, b, c) })
  return ret
}
