/*!

   Riot.js 0.9.0 | moot.it/riotjs

   (c) 2013 Tero Piirainen, Moot Inc

   @license: MIT

*/
(function($, win, undefined) {

   var
      // each template gets its own cached renderer function
      renderers = {},

      // these are injected into the compiled templates to aid in rendering
      templateHelpers = {
         // minifiers will not alter object keys
         raw: function (string) {
            return stringify(string);
         },
         html: function (string) {
            return stringify(string).replace(/[&<>"']/g, function (m) { return '&' + m.charCodeAt() + ';'; });
         }
      },

      page_popped;

   /**
    * Turn an arbitrary template value into a string
    *
    * @param {*} val
    * @returns {String} Empty string if val is undefined/null
    */
   function stringify(val) {
      return (val === undefined || val === null) ? "" : val + "";
   }

   /**
    * Turns a string template into a renderer function.
    *
    * @param {String} template
    * @returns {Function} The renderer function accepts a string and an object of helper functions
    */
   function createRenderer(template) {
      var expression = "'" + $.trim(template)
         .replace(/[\n\\']/g, function (m) {
            return {"\n":"\\n", "\\":"\\\\", "'":"\\'"}[m];
         })
         .replace(/\{(\w+:)?([a-zA-Z_$][0-9a-zA-Z_$]*)\}/g, function (m, helper, placeholder) {
            helper = helper ? helper.substr(0, helper.length - 1) : 'html';
            if (!templateHelpers[helper]) {
               return m;
            }
            return "'+h." + helper + "(v." + placeholder + ")+'";
         }) +
         "'";
      // v = template vars, h = template helpers
      return Function('v', 'h', "return " + expression);
   }

   /**
    * Render properties of an object into a template with placeholders
    *
    * Placeholders like "{prop}" will be replaced by data[prop] after being HTML-escaped.
    *
    * Prepend "raw:" to the placeholder identifier to bypass HTML-escaping. E.g. "{raw:prop}"
    *
    * @param {String} template String with placeholders like "{prop}" or "{raw:prop}"
    * @param {Object} data     Object with property names matching the placeholders
    * @returns {String}
    */
   $.render = function(template, data) {
      // on first call, create a renderer for the template
      return (renderers[template] = renderers[template] || createRenderer(template))(data, templateHelpers);
   };

   /**
    * Return a jQueried element generated from a template
    *
    * @param {String} template String with placeholders like "{prop}" or "{raw:prop}"
    * @param {Object} data     Object with property names matching the placeholders
    * @returns {jQuery}
    * @see render()
    */
   $.el = function(template, data) {
      return $($.render(template, data));
   };

   /**
    * Extend an object with methods to manage events: on(), one(), emit(), and off()
    *
    * A classic pattern for separating concerns
    *
    * @param {Object} obj
    * @return {Object}
    */
   $.observable = function(obj) {
      var jq = $({});

      $.each(['on', 'one', 'emit', 'off'], function(i, name) {
         obj[name] = function(names, fn) {

            if (i < 2) {
               jq[name](names, function(e) {
                  var args = [].slice.call(arguments, 1);
                  if (names.split(" ")[1]) {
                     args.unshift(e.type);
                  }
                  fn.apply(obj, args);
               });

            } else if (i == 2) {
               jq.trigger(names, [].slice.call(arguments, 1));

            } else {
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
   win.on("load", function(e) {
      setTimeout(function() {
         if (!page_popped) {
            win.trigger("popstate");
         }
      }, 1);

   }).on("popstate", function(e) {
      page_popped = true;
   });

   /**
    * Change the browser URL or register a function to listen for changes on the URL
    *
    * @param {Function|String} to
    */
   $.route = function(to) {

      // listen
      if ($.isFunction(to)) {
         win.on("popstate", function(e, hash) {
            to(hash || location.hash)
         });

      // fire
      } else if (to != location.hash) {
         if (history.pushState) {
            history.pushState("", "", to);
         }
         win.trigger("popstate", [to]);
      }

   };


})(jQuery, window);
