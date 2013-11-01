/*

   Riot.js 0.9.0 | moot.it/riotjs

   (c) 2013 Tero Piirainen, Moot Inc

   @license: MIT

*/
(function($, win) {

   // (JavaScript functions)
   var compiledTemplates = {};

   // functions injected into the compiled template.
   var templateFunctions = {
      // minifiers will not alter object keys
      raw: function (string) { // raw
         return string;
      },
      html: function (string) { // HTML escaped
         return string.replace(/[&<>"']/g, function (m) { return '&' + m.charCodeAt() + ';'; });
      }
   };
   
   function compile(template) {
      var strContent = $.trim(template)
         .replace(/[\n\\']/g, function (m) { return {"\n":"\\n", "\\":"\\\\", "'":"\\'"}[m]; })
         .replace(/\{(\w+:)?([a-zA-Z_$][0-9a-zA-Z_$]*)\}/g, function (m, f, id) {
            f = f || "html:";
            return "'+(_." + id + "!==undefined?h." + f.substr(0, f.length - 1) + "(_." + id + "):'')+'";
         });
      return Function('_', 'h', "return '" + strContent + "'");
   }

   // Render a template with data
   $.render = function(template, data) {
      return (compiledTemplates[template] = compiledTemplates[template] || compile(template))(data, templateFunctions);
   }

   // A convenience render method to return a jQuery element
   $.el = function(template, data) {
      return $($.render(template, data));
   }

   // A classic pattern for separating concerns
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
