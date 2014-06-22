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
  var route = riot.observable(function(to, callback) {
    (callback || typeof to === "object") ? set(to, callback) : redirect(to);
  }), map = {};

  function set(to, callback) {
    if (!callback) {
      return Object.keys(to).forEach(function(key) { set(key, to[key]) });
    }

    map[to] = callback;
    route.trigger("map", to, callback);
  }

  function redirect(to) {
    if (map[to]) {
      map[to]({path: to});
    } else {
    }
    route.trigger("redirect", to);
  }

  route.map = map
  return route;
})();
