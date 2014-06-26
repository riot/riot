
riot.route = (function() {
  var map = {},
      fnMap = [],
      paramsRegEx = /\{\w+\}/g,
      paramsReplace = "(\\w+)",
      escapeRegEx  = /[\/\=\?\$\^]/g,
      escapeReplace = "\\$&";

  function route(to, callback) {
    if (typeof to === "function") {
      fnMap.push(to);
    } else if (callback || typeof to === "object") {
      set(to, callback);
    } else execute(to);
    return to;
  }

  function set(to, callback) {
    var key;

    if (!callback) {
      for (key in to) to.hasOwnProperty(key) && set(key, to[key]);
      return;
    }

    map[to] = callback;
  }

  function execute(to) {
    map[to] ? map[to]({path: to}) : execMatch(to) || execFn(to);
    route.trigger("execute", to);
  }

  function execMatch(to) {
    var key, matches, matchKeys, regex;

    for (key in map) {
      if (!map.hasOwnProperty(key)) continue;
      matchKeys = key.match(paramsRegEx);
      regex = key
        .replace(escapeRegEx, escapeReplace)
        .replace(paramsRegEx, paramsReplace);

      matches = to.match(new RegExp("^\#?\!?" + regex + "$"));
      if (matches) return map[key](getParams(to, matchKeys, matches));
    }
  }

  function execFn(to) {
    var callbacks = riot.route.fnMap, i;
    for (i = 0; i < callbacks.length; i++) callbacks[i](to);
  }

  function getParams(to, keys, values) {
    var params = {path: to}, i;

    for (i = 1; i < values.length; i++) {
      params[keys[i - 1].slice(1, -1).trim()] = values[i];
    }

    return params;
  }

  route.map = map;
  route.fnMap = fnMap;
  return riot.observable(route);
})();

// Browser Navigation
if (typeof window !== "undefined") {
  // redirect to route, push state
  riot.route.on("execute", function(to) {
    try {
      history.pushState(null, null, to);
    } catch (err) {
      window.location = to[0] === "#" ? to : "#" + to;
    }
  }).on("load", function() {
    this(location.pathname + location.search + location.hash);
  });

  // Mozilla, Opera and webkit nightlies currently support this event
  if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function() {
      riot.route.trigger("load");
    }, false);

  // If IE event model is used
  } else if (document.attachEvent) {
    document.attachEvent("onreadystatechange", function() {
      if (document.readyState === "complete") riot.route.trigger("load");
    });
  }
}
