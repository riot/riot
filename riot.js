/*!

   Riot!js v1.0 | https://moot.it/riotjs

   (c) 2013 Moot Inc

   License: MIT

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

   $.observable = function(obj) {
      var jq = $({});

      $.each(['on', 'one', 'emit', 'off'], function(i, name) {
         obj[name] = function(names, fn) {

            if (i < 2) {
               jq[name](names, function(e) {
                  var args = [].slice.call(arguments, 1);
                  if (names.split(" ")[1]) args.unshift(e.type);
                  fn.apply(obj, args);
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

   // $(document).on("click.todo", 'a[href~="#"]', $.route);

   $.route = function(fn) {
      if (typeof fn == "string") {
         history.pushState(null, null, "#" + fn);

      } else {
         $(window).bind("popstate.riot", function(e) {
            fn(location.hash.split("#")[1] || "", e.originalEvent.state);
         })
      }
   }

   // popstate should fire on page load according to the spec
   if ('state' in window.history) $(window).triggerHandler("popstate.riot");


})(jQuery)
