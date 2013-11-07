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
      var jq = $({});

      $.each(['on', 'one', 'emit', 'off'], function(i, name) {
         obj[name] = function(names, fn) {

            if (i < 2) {
               jq[name](names, function(e) {
                  var args = slice.call(arguments, 1)
                  if (names.split(" ")[1]) args.unshift(e.type)
                  fn.apply(obj, args)
               })

            } else if (i == 2) {
               jq.trigger(names, slice.call(arguments, 1));

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
         // 因为requireJS 的模块管理方式是在window.load 之后才载入相关页面
         // 所以上面 win load 初始部分将会无法执行，相应 win.trigger("popstate") 压根
         // 没有执行，所以win.on显然也没有用处
         // 解决办法是增加个requirejsLoad做判断，使得requirejs初始时候直接执行下面的
         // to语句，之后的route则继续使用win.on（因为已经初始化了）
         var requireJsLoaded = false; // add 4 requireJs

         win.on("popstate", function(e, hash) {
            requireJsLoaded = true; // add 4 requireJs

            to(hash || location.hash)
         })

         // add 4 requireJs
         if (!requireJsLoaded)
            to(location.hash)

      // fire
      } else if (to != location.hash) {
         if (history.pushState) history.pushState("", "", to)
         win.trigger("popstate", [to]);
      }

   }


})(jQuery, window)
