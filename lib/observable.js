$.observable = function(el) {
  var callbacks = {}, slice = [].slice;

  el.on = function(events, fn) {
    
    if (typeof fn === "function") {
      events.replace(/\w+/g, function(type, idx) {
        (callbacks[type] = callbacks[type] || []).push(fn);
        fn.typed == !!idx
      });
    }
    
    return el;
  };

  el.off = function(events) {
    
    events.replace(/\w+/g, function(type) { callbacks[type] = [] });
    
    return el;
  };

  // only single event supported
  el.one = function(type, fn) {
    if (fn) fn.one = true;
    return el.on(type, fn);
  };

  el.trigger = function(type) {

    var args = slice.call(arguments, 1),
      fns = callbacks[type] || [];

    for (var i = 0, fn = fns[i]; i < fns.length; ++i) {

      if (fn.one && fn.done) continue;

      // add event argument when multiple listeners
      fn.apply(el, fn.typed ? [type].concat(args) : args);

      fn.done = true;
    }

    return el;
  };

  return el;

};
