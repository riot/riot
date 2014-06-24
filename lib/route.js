/* Change the browser URL or listen to changes on the URL */
riot.route = (function() {
  var map = {},
      paramsRegEx = /\{\w+\}/g,
      paramsReplace = "(\\w+)",
      escapeRegEx  = /[\/\=\?\$\^]/g;

  function route(to, callback) {
    (callback || typeof to === "object") ? set(to, callback) : execute(to);
  }

  function set(to, callback) {
    if (!callback) {
      return Object.keys(to).forEach(function(key) { set(key, to[key]) });
    }

    map[to] = callback;
  }

  function execute(to) {
    map[to] ? map[to]({path: to}) : fetch(to);
    route.trigger("execute", to);
  }

  function fetch(to) {
    var keys = Object.keys(map),
      i, key, matches, matchKeys, regex;

    for(i = 0; i < keys.length; i++) {
      key = keys[i];
      matchKeys = key.match(paramsRegEx);
      regex = key
        .replace(escapeRegEx, '\\$&')
        .replace(paramsRegEx, paramsReplace);

      matches = to.match(new RegExp("^\#?\!?" + regex + "$"));
      if (matches) return map[key](getParams(to, matchKeys, matches));
    }
  }

  function getParams(to, keys, values) {
    var params = {path: to}, i;

    for (i = 1; i < values.length; i++) {
      params[keys[i - 1].slice(1, -1).trim()] = values[i];
    }

    return params;
  }

  route.map = map
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
  } else if ( document.attachEvent ) {
    document.attachEvent("onreadystatechange", function() {
      if (document.readyState === "complete") riot.route.trigger("load");
    });
  }
}
