
(function(top) { "use strict";
  /*global setTimeout, history, location */

  var $ = top.$; // jQuery or Zepto

  // avoid multiple execution. popstate should be fired only once etc.
  if ($.riot) return;

  $.riot = "0.9.5";

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

  // cross browser popstate
  var currentHash,
    fn = $.observable({});

  function pop(hash) {
    hash = hash.type ? location.hash : hash;
    if (hash != currentHash) fn.trigger("pop", hash);
    currentHash = hash;
  }

  $(pop);
  $(top).on("popstate", pop);

  // Change the browser URL or listen to changes on the URL
  $.route = function(to) {

    // listen
    if (typeof to == "function") return fn.on("pop", to);

    // fire
    if (history.pushState) history.pushState("", "", to);
    pop(to);

  };

})(window);
