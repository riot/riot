/*
	Riot.js 0.9.7 | moot.it/riotjs | @license MIT
	(c) 2013 Tero Piirainen, Moot Inc and other contributors.
*/
(function($) { "use strict";

$.observable = function(el) {
  var callbacks = {}, slice = [].slice;

  el.on = function(events, fn) {

    if (typeof fn === "function") {
      events = events.split(/\s+/);

      for (var i = 0, len = events.length, type; i < len; i++) {
        type = events[i];
        (callbacks[type] = callbacks[type] || []).push(fn);
        if (len > 1) fn.typed = true;
      }
    }
    return el;
  };

  el.off = function(events) {
    events = events.split(/\s+/);

    for (var i = 0; i < events.length; i++) {
      callbacks[events[i]] = [];
    }

    return el;
  };

  // only single event supported
  el.one = function(type, fn) {
    if (fn) fn.one = true;
    return el.on(type, fn);

  };

  el.trigger = function(type) {

    var args = slice.call(arguments, 1),
      fns = callbacks[type] || [];

    for (var i = 0, fn; i < fns.length; ++i) {
      fn = fns[i];

      if (fn.one && fn.done) continue;

      // add event argument when multiple listeners
      fn.apply(el, fn.typed ? [type].concat(args) : args);

      fn.done = true;
    }

    return el;
  };

  return el;

};

// Precompiled templates (JavaScript functions)
var FN = {};

// Render a template with data
$.render = function(template, data) {
  if(!template) return '';

  FN[template] = FN[template] || new Function("_",
    "return '" + template
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/'/g, "\\'")
      .replace(/\{\s*(\w+)\s*\}/g, "'+(_.$1?(_.$1+'').replace(/&/g,'&amp;').replace(/\"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):(_.$1===0?0:''))+'") + "'"
  );

  return FN[template](data);
};


// browsers only
if (typeof top != "object") return;

// cross browser popstate
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
