/*!

   Riot!js v1.0 | https://moot.it/riotjs

   (c) 2013 Moot Inc

   License: MIT

*/
(function($, win) {

   // Precompiled templates (JavaScript functions)
   var FN = {};


   // Render a template with data
   $.render = function(template, data) {
      return (FN[template] = FN[template] || Function("_", "return '" +
         template.replace(/\n/g, "").replace(/\{([^\}]+)\}/g, "'+_.$1+'") + "'")
      )(data);
   }

   // A convenience render method to return a jQuery element
   $.el = function(template, data) {
      return $($.render(template, data));
   }

   // A classic pattern to enable MVP
   $.observable = function(obj) {
      var jq = $({});

      $.each(['on', 'one', 'emit', 'off'], function(i, name) {
         obj[name] = function(names, fn) {

            if (i < 2) {
               jq[name](names, function(e) {
                  var args = [].slice.call(arguments, 1)
                  if (names.split(" ")[1]) args.unshift(e.type)
                  fn.apply(obj, args)
               })

            } else if (i == 2) {
               jq.trigger(names, [].slice.call(arguments, 1));

            } else {
               jq.off(names, fn);
            }

            return obj;
         }
      })

      return obj;
   }

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
   $.route = function(url) {

      // listen
      if ($.isFunction(url)) {
         win.on("popstate", function(e, to) {
            url(to || location.hash)
         })

      // fire
      } else if (url != location.hash) {
         if (history.pushState) history.pushState("", "", url)
         win.trigger("popstate", [url]);
      }

   }


})(jQuery, window)
