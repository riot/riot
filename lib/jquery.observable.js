
var slice = Array.prototype.slice;

$.observable = function(obj) {

   var jq = $({});
   var functionMap = {};

   $.each(['on', 'one', 'trigger', 'off'], function(i, name) {
      obj[name] = function(names, fn) {

         if (i < 2) {
            var handler = function(e) {
               var args = slice.call(arguments, 1)
               if (names.split(" ")[1]) args.unshift(e.type)
               fn.apply(obj, args)
            };
            functionMap[fn] = handler;
            jq[name](names, handler);

         } else if (i == 2) {
            jq.trigger(names, slice.call(arguments, 1));

         } else {
            jq.off(names, functionMap[fn]);
            delete functionMap[fn];
         }

         return obj;
      }
   });

   return obj;
};
