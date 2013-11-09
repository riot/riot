
/*
  Riot.js 0.9.4 | moot.it/riotjs | @license MIT
  (c) 2013 Tero Piirainen, Moot Inc and other contributors.
 */
"use strict";
(function(top) {

  top.$ = top.$ || {};

  // avoid multiple execution. popstate should be fired only once etc.
  if ($.riot) return;

  $.riot = "0.9.4";

  function isFunction(el) {
    return Object.prototype.toString.call(el) == '[object Function]';
  }

  $.observable = function(el) {

    var callbacks = {},
      slice = [].slice;

    el.on = function(events, fn) {
      if (isFunction(fn)) {
        events = events.split(/\s+/);

        for (var i = 0, len = events.length, type; i < len; i++) {
          type = events[i];
          (callbacks[type] = callbacks[type] || []).push(fn);
          if (len > 1) fn.typed = true;
        }
      }
      return el;
    }

    el.off = function(events, fn) {
      events = events.split(/\s+/);

      for (var j = 0, type; j < events.length; j++) {
        type = events[j];

        // remove single type
        if (!fn) { callbacks[type] = []; continue; }

        var fns = callbacks[type] || [],
          pos = -1;

        for (var i = 0, len = fns.length; i < len; i++) {
          if (fns[i] === fn || fns[i].listener === fn) { pos = i; break; }
        }

        if (pos >= 0) fns.splice(pos, 1);
      }
      return el;
    }

    // only single event supported
    el.one = function(type, fn) {

      function on() {
        el.off(type, fn);
        fn.apply(el, arguments);
      }

      if (isFunction(fn)) {
        on.listener = fn;
        el.on(type, on);
      }

      return el;
    }

    el.trigger = function(type) {

      var args = slice.call(arguments, 1),
        fns = callbacks[type] || [];

      for (var i = 0, len = fns.length, fn, added; i < len; ++i) {
        fn = fns[i];

        // possibly removed
        if (!fn) continue;

        // add event argument when multiple listeners
        fn.apply(el, fn.typed ? [type].concat(args) : args)

      }

      return el;
    }

    return el;

  }

  // emit window.popstate event consistently on page load, on every browser
  var page_popped,
    fn = $.observable({});

  function pop(hash) {
    fn.trigger("pop", hash || location.hash)
  }

  function on(event, fn) {
    window.addEventListener(event, fn, false)
  }

  on("load", function() {
    setTimeout(function() { page_popped || pop(); }, 1);
  });

  on("popstate", function(e) {
    if (!page_popped) page_popped = true;
    pop();
  });

  // Change the browser URL or listen to changes on the URL
  $.route = function(to) {

    // listen
    if (isFunction(to)) {
      fn.on("pop", to);

    // fire
    } else if (to != location.hash) {
      if (history.pushState) history.pushState("", "", to);
      pop(to);
    }

  };

})(window);