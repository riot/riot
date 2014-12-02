/* Cross browser popstate */
(function () {
  // for browsers only
  if (typeof window === "undefined") return;

  var currentHash,
    pops = riot.observable({}),
    listen = window.addEventListener,
    doc = document;

  function pop(hash, redirect) {
    hash = hash.type ? location.hash : hash;
    if (hash !== currentHash && redirect) pops.trigger("pop", hash);
    currentHash = hash;
  }

  /* Always fire pop event upon page load (normalize behaviour across browsers) */

  // standard browsers
  if (listen) {
    listen("popstate", pop, false);
    doc.addEventListener("DOMContentLoaded", pop, false);

  // IE
  } else {
    doc.attachEvent("onreadystatechange", function() {
      if (doc.readyState === "complete") pop("");
    });
  }

  /* Change the browser URL or listen to changes on the URL */
  riot.route = function(to, redirect) {
    // default redirect value is true
    redirect = typeof redirect !== "undefined" ? !!redirect : true;

    // listen
    if (typeof to === "function") return pops.on("pop", to);

    // fire
    if (history.pushState) history.pushState(0, 0, to);
    pop(to, redirect);

  };
})();
