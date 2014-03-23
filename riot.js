/* Riot 0.9.9, @license MIT, (c) 2014 Moot Inc + contributors */
(function($) { "use strict";

$.observable = function(el) {
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

  el.off = function(events) {
    events.replace(/[^\s]+/g, function(name) {
      callbacks[name] = [];
    });
    if (events == "*") callbacks = {};
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

function escape(str) {
  return str == undefined ? '' : (str+'').replace(/[&\"<>]/g, function(char) {
    return render_escape[char];
  });
}

$.render = function(tmpl, data, escape_fn) {
  if (typeof escape_fn != 'function' && escape_fn !== false) escape_fn = escape;
  tmpl = tmpl || '';

  return (FN[tmpl] = FN[tmpl] || new Function("_", "e", "return '" +

    tmpl.replace(/[\\\n\r']/g, function(char) {
      return template_escape[char];

    }).replace(/{\s*([\w\.]+)\s*}/g, "'+(function(){try{return e?e(_.$1):_.$1}catch(e){return ''}})()+'") + "'"

  ))(data, escape_fn);

};

/* Cross browser popstate */

// for browsers only
if (typeof top != "object") return;

var currentHash,
  pops = $.observable({}),
  listen = window.addEventListener,
  doc = document;

function pop(hash) {
  hash = hash.type ? location.hash : hash;
  if (hash != currentHash) pops.trigger("pop", hash);
  currentHash = hash;
}

if (listen) {
  listen("popstate", pop, false);
  doc.addEventListener("DOMContentLoaded", pop, false);

} else {
  doc.attachEvent("onreadystatechange", function() {
    if (doc.readyState === "complete") pop("");
  });
}

// Change the browser URL or listen to changes on the URL
$.route = function(to) {
  // listen
  if (typeof to === "function") return pops.on("pop", to);

  // fire
  if (history.pushState) history.pushState(0, 0, to);
  pop(to);

};})(typeof top == "object" ? window.$ || (window.$ = {}) : exports);
