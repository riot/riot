
function isFunction(el) {
   return Object.prototype.toString.call(el) == '[object Function]';
}

function observable(el) {

   var callbacks = {},
      slice = [].slice;

   el.on = function(events, fn) {
      if (isFunction(fn)) {
         events = events.split(/\s+/);

         for (var i = 0, len = events.length, type; i < len; i++) {
            type = events[i];
            (callbacks[type] = callbacks[type] || []).push(fn);
            if (len > 1) fn.typed = true;
         }
      }
      return el;
   }

   el.off = function(events, fn) {
      events = events.split(/\s+/);

      for (var j = 0, type; j < events.length; j++) {
         type = events[j];

         // remove single type
         if (!fn) { callbacks[type] = []; continue; }

         var fns = callbacks[type] || [],
            pos = -1;

         for (var i = 0, len = fns.length; i < len; i++) {
            if (fns[i] === fn || fns[i].listener === fn) { pos = i; break; }
         }

         if (pos >= 0) fns.splice(pos, 1);
      }
      return el;
   }

   // only single event supported
   el.one = function(type, fn) {

      function on() {
         el.off(type, fn);
         fn.apply(el, arguments);
      }

      if (isFunction(fn)) {
         on.listener = fn;
         el.on(type, on);
      }

      return el;
   }

   el.trigger = function(type) {

      var args = slice.call(arguments, 1),
         fns = callbacks[type] || [];

      for (var i = 0, len = fns.length, fn, added, params; i < len; ++i) {
         fn = fns[i];

         // possibly removed
         if (!fn) continue;

         // add event argument when multiple listeners
         params = fn.typed ? [type].concat(args) : args;
         if (fn.apply(el, params) === false) return el;
      }

      return el;
   }

   return el;

}

