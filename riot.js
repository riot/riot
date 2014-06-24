/* Riot 1.0.2, @license MIT, (c) 2014 Muut Inc + contributors */
(function(riot) { "use strict";

riot.observable = function(el) {
  var callbacks = {}, slice = [].slice;

  el.on = function(events, fn) {
    if (typeof fn === "function") {
      events.replace(/[^\s]+/g, function(name, pos) {
        (callbacks[name] = callbacks[name] || []).push(fn);
        fn.typed = pos > 0;
      });
    }
    return el;
  };

  el.off = function(events, fn) {
    if (events === "*") callbacks = {};
    else if (fn) {
      var arr = callbacks[events];
      for (var i = 0, cb; (cb = arr && arr[i]); ++i) {
        if (cb === fn) arr.splice(i, 1);
      }
    } else {
      events.replace(/[^\s]+/g, function(name) {
        callbacks[name] = [];
      });
    }
    return el;
  };

  // only single event supported
  el.one = function(name, fn) {
    if (fn) fn.one = true;
    return el.on(name, fn);
  };

  el.trigger = function(name) {
    var args = slice.call(arguments, 1),
      fns = callbacks[name] || [];

    for (var i = 0, fn; (fn = fns[i]); ++i) {
      if (!fn.busy) {
        fn.busy = true;
        fn.apply(el, fn.typed ? [name].concat(args) : args);
        if (fn.one) { fns.splice(i, 1); i--; }
        fn.busy = false;
      }
    }

    return el;
  };

  return el;

};
var FN = {}, // Precompiled templates (JavaScript functions)
  template_escape = {"\\": "\\\\", "\n": "\\n", "\r": "\\r", "'": "\\'"},
  render_escape = {'&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;'};

function default_escape_fn(str, key) {
  return str == null ? '' : (str+'').replace(/[&\"<>]/g, function(char) {
    return render_escape[char];
  });
}

riot.render = function(tmpl, data, escape_fn) {
  if (escape_fn === true) escape_fn = default_escape_fn;
  tmpl = tmpl || '';

  return (FN[tmpl] = FN[tmpl] || new Function("_", "e", "return '" +
    tmpl.replace(/[\\\n\r']/g, function(char) {
      return template_escape[char];
    }).replace(/{\s*([\w\.]+)\s*}/g, "' + (e?e(_.$1,'$1'):_.$1||(_.$1==null?'':_.$1)) + '") + "'")
  )(data, escape_fn);
};
/* Cross browser popstate */
// for browsers only
//if (typeof window === "undefined") return;

var currentHash,
  pops = riot.observable({}),
  listen = window.addEventListener,
  doc = document;

function pop(hash) {
  hash = hash.type ? location.hash : hash;
  if (hash !== currentHash) pops.trigger("pop", hash);
  currentHash = hash;
}

/* Always fire pop event upon page load (normalize behaviour across browsers) */

// standard browsers
//if (listen) {
//  listen("popstate", pop, false);
//  doc.addEventListener("DOMContentLoaded", pop, false);

//// IE
//} else {
//  doc.attachEvent("onreadystatechange", function() {
//    if (doc.readyState === "complete") pop("");
//  });
//}

/* Change the browser URL or listen to changes on the URL */
riot.route = (function() {
  var map = {},
      paramsRegExp = /\{\w+\}/g,
      paramsReplace = "(\\w+)",
      escapeRegExp  = /[\/\=\?\$\^]/g,
      route = riot.observable(function(to, callback) {
        (callback || typeof to === "object") ? set(to, callback) : execute(to);
      });

  function set(to, callback) {
    if (!callback) {
      return Object.keys(to).forEach(function(key) { set(key, to[key]) });
    }

    map[to] = callback;
    route.trigger("map", to, callback);
  }

  function execute(to) {
    map[to] ? map[to]({path: to}) : fetch(to);
    route.trigger("redirect", to);
  }

  function fetch(to) {
    var keys = Object.keys(map),
      i, key, matches, matchKeys, regex;

    for(i = 0; i < keys.length; i++) {
      key = keys[i];
      matchKeys = key.match(paramsRegExp);
      regex = key
        .replace(escapeRegExp, '\\$&')
        .replace(paramsRegExp, paramsReplace);

      matches = to.match(new RegExp("^" + regex + "$"));
      if (matches) return map[key](getParams(to, matchKeys, matches));
    }
  }

  function getParams(to, keys, values) {
    var params = {path: to}, i;

    for (i = 1; i < values.length; i++) {
      params[keys[i - 1].slice(1, -1).trim()] = values[i];
    }

    return params;
  }

  route.map = map
  return route;
})();
})(typeof exports !== "undefined" ? exports : window.riot = {});
