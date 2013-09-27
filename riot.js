/*
   Riot.js v1.0

   "The 1kb MVP "framework".

   https://moot.it/riotjs

   MIT Licensed

*/
(function($) {

   // Precompiled templates (JavaScript functions)
   var FN = {};

   $.render = function(tmpl, data) {
      return (FN[tmpl] = FN[tmpl] || Function("_", "return '" +
         tmpl.replace(/\n/g, "").replace(/\{\s*([^\}]+)\s*\}/g, "'+_.$1+'") + "'")
      )(data);
   }

   // @return jQuery element
   $.el = function(tmpl, data) {
      return $($.trim($.render(tmpl, data)));
   }

   function last(args) {
      return [].slice.call(args).slice(1);
   }

   $.emitter = function(obj) {
      var jq = $({});

      $.each(['on', 'one', 'emit', 'off'], function(i, name) {
         obj[name] = function(names, fn) {

            if (i < 2) {
               jq[name](names, function() {
                  fn.apply(obj, last(arguments));
               })
            } else if (i == 2) {
               jq.trigger(names, last(arguments));

            } else {
               jq.off(names, fn);
            }

            return obj;
         }
      })

      return obj;
   }

   $.route = function(fn) {
      if (typeof fn == "string") {
         history.pushState(null, null, "#" + fn);

      } else {
         $(window).bind("popstate.mvc", function() {
            fn(location.hash.split("#")[1] || "");
         })
      }
   }

   // manual trigger of popstate for non-webkit
   if ('state' in window.history) $(window).triggerHandler("popstate.mvc");

})(jQuery)
