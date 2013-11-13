

(function(top) { "use strict";
  /*global setTimeout, history, location, document */

  var $ = top.$ = top.$ || {};

  // avoid multiple execution. popstate should be fired only once etc.
  if ($.riot) return;

  $.riot = "0.9.5";

  $.observable = function(el) {

    var callbacks = {},
      slice = [].slice;

    el.on = function(events, fn) {

      if (typeof fn == "function") {
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

  // cross browser popstate
  var currentHash,
    fn = $.observable({}),
    listen = top.addEventListener,
    doc = document;

  function pop(hash) {
    hash = hash.type ? location.hash : hash;
    if (hash != currentHash) fn.trigger("pop", hash);
    currentHash = hash;
  }

  if (listen) {
    listen("popstate", pop, false);
    doc.addEventListener("DOMContentLoaded", pop, false);

  } else {
    doc.attachEvent("onreadystatechange", function() {
      if (doc.readyState == "complete") pop();
    });

  }

  // Change the browser URL or listen to changes on the URL
  $.route = function(to) {

    // listen
    if (typeof to == "function") return fn.on("pop", to);

    // fire
    if (history.pushState) history.pushState("", "", to);
    pop(to);

  };

})(window);
