/*

   Riot.js 0.9.0 | moot.it/riotjs

   (c) 2013 Tero Piirainen, Moot Inc

   @license: MIT

*/
(function($, win) {

   // Precompiled templates (JavaScript functions)
   var FN = {},
      slice = [].slice;


   // Render a template with data
   $.render = function(template, data) {
      return (FN[template] = FN[template] || Function("_", "return '" +
         $.trim(template).replace(/\n/g, "\\n").replace(/\{([^\}]+)\}/g, "'+_.$1+'") + "'")
      )(data);
   }

   // A convenience render method to return a jQuery element
   $.el = function(template, data) {
      return $($.render(template, data));
   }

   // A classic pattern for separating concerns
   $.observable = function(obj) {
      var
         // keep a jQuery instance private to the obj
         jq = $({}),

         // maintain a collection of the user-given listeners, along with the anonymous wrappers
         // created for them. See https://github.com/moot/riotjs/issues/25
         listeners = [];

      $.each(['on', 'one', 'emit', 'off'], function(i, name) {
         obj[name] = function(names, fn) {

            if (i < 2) {
               var listener = {
                  fn: fn,
                  wrapper: function(e) {
                     var args = slice.call(arguments, 1);
                     if (names.split(" ")[1]) {
                        args.unshift(e.type);
                     }
                     fn.apply(obj, args);
                  }
               };
               jq[name](names, listener.wrapper);
               listeners.push(listener);

            } else if (i == 2) {
               jq.trigger(names, slice.call(arguments, 1));

            } else {
               // try to match fn with the original handler set by the user, but instead pass
               // in the wrapper to jq.off
               for (var j = 0, l = listeners.length; j < l; j++) {
                  if (fn === listeners[j].fn) {
                     jq.off(names, listeners[j].wrapper);
                     return obj;
                  }
               }

               jq.off(names, fn);
            }

            return obj;
         };
      });

      return obj;
   };

   // jQueried window object
   win = $(win);

   // emit window.popstate event consistently on page load, on every browser
   var page_popped;

   win.on("load", function(e) {
      setTimeout(function() {
         if (!page_popped) win.trigger("popstate")
      }, 1);

   }).on("popstate", function(e) {
      if (!page_popped) page_popped = true;

   })

   // Change the browser URL or listen to changes on the URL
   $.route = function(to) {

      // listen
      if ($.isFunction(to)) {
         win.on("popstate", function(e, hash) {
            to(hash || location.hash)
         })

      // fire
      } else if (to != location.hash) {
         if (history.pushState) history.pushState("", "", to)
         win.trigger("popstate", [to]);
      }

   }


})(jQuery, window)
