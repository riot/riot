
/*
  Riot.js 0.9.4 | moot.it/riotjs | @license MIT
  (c) 2013 Tero Piirainen, Moot Inc and other contributors.
 */
(function(top) { "use strict";
  /*global setTimeout, history, location */

  var $ = top.$ = top.$ || {};

  // avoid multiple execution. popstate should be fired only once etc.
  if ($.riot) return;

  $.riot = "0.9.4";

  // http://stackoverflow.com/questions/17108122/isfunctiona-vs-typeof-a-function-javascript

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

  // emit window.popstate event consistently on page load, on every browser
  var page_popped,
    fn = $.observable({});

  function pop(hash) {
    fn.trigger("pop", hash || location.hash);
  }

  function on(event, fn) {
    top.addEventListener(event, fn, false);
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
    if (typeof to == "function") {
      fn.on("pop", to);

    // fire
    } else if (to != location.hash) {
      if (history.pushState) history.pushState("", "", to);
      pop(to);
    }

  };

})(window);
