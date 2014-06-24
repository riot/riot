/* Cross browser popstate */
// for browsers only
//if (typeof window === "undefined") return;

var currentHash,
  pops = riot.observable({}),
  listen = window.addEventListener,
  doc = document;

function pop(hash) {
  hash = hash.type ? location.hash : hash;
  if (hash !== currentHash) pops.trigger("pop", hash);
  currentHash = hash;
}

/* Always fire pop event upon page load (normalize behaviour across browsers) */

// standard browsers
//if (listen) {
//  listen("popstate", pop, false);
//  doc.addEventListener("DOMContentLoaded", pop, false);

//// IE
//} else {
//  doc.attachEvent("onreadystatechange", function() {
//    if (doc.readyState === "complete") pop("");
//  });
//}

/* Change the browser URL or listen to changes on the URL */
riot.route = (function() {
  var map = {},
      paramsRegExp = /\{\w+\}/g,
      paramsReplace = "(\\w+)",
      escapeRegExp  = /[\/\=\?\$\^]/g,
      route = riot.observable(function(to, callback) {
        (callback || typeof to === "object") ? set(to, callback) : execute(to);
      });

  function set(to, callback) {
    if (!callback) {
      return Object.keys(to).forEach(function(key) { set(key, to[key]) });
    }

    map[to] = callback;
    route.trigger("map", to, callback);
  }

  function execute(to) {
    map[to] ? map[to]({path: to}) : fetch(to);
    route.trigger("redirect", to);
  }

  function fetch(to) {
    var keys = Object.keys(map),
      i, key, matches, matchKeys, regex;

    for(i = 0; i < keys.length; i++) {
      key = keys[i];
      matchKeys = key.match(paramsRegExp);
      regex = key
        .replace(escapeRegExp, '\\$&')
        .replace(paramsRegExp, paramsReplace);

      matches = to.match(new RegExp("^" + regex + "$"));
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
  return route;
})();
