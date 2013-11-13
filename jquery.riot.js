/*
  Riot.js 0.9.4 | moot.it/riotjs | @license MIT
  (c) 2013 Tero Piirainen, Moot Inc and other contributors.
 */
(function(top) { "use strict";
  /*global setTimeout, history, location */

  var $ = top.$; // jQuery or Zepto

  // avoid multiple execution. popstate should be fired only once etc.
  if ($.riot) return;

  $.riot = "0.9.4";

  // A classic pattern for separating concerns
  var slice = [].slice;

  $.observable = function(obj) {

    var $el = $("<a/>"); // plain object not working on Zepto

    $.each(['on', 'one', 'trigger', 'off'], function(i, name) {
      obj[name] = function(names, fn) {

        // on, one
        if (i < 2) {
          $el[name](names, function(e) {
            var args = slice.call(arguments, 1);
            if (names.split(" ")[1]) args.unshift(e.type);
            fn.apply(obj, args);
          });

        // trigger
        } else if (i === 2) {
          $el.trigger(names, slice.call(arguments, 1));

        // off
        } else {
          $el.off(names);
        }

        return obj;
      };

    });

    return obj;
  };

  // jQueried window object
  var $win = $(top);

  // emit window.popstate event consistently on page load, on every browser
  var page_popped;

  $win.on("load", function(e) {
    setTimeout(function() { page_popped || $win.trigger("popstate"); }, 1);

  }).on("popstate", function(e) {
    if (!page_popped) page_popped = true;

  });

  // Change the browser URL or listen to changes on the URL
  $.route = function(to) {

    // listen
    if ($.isFunction(to)) {
      $win.on("popstate", function(e, hash) {
        to(hash || location.hash);
      });

    // fire
    } else if (to != location.hash) {
      if (history.pushState) history.pushState("", "", to);
      $win.trigger("popstate", [to]);
    }

  };

})(window);
