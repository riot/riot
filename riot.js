/* Riot 1.1.0, @license MIT, (c) 2014 Muut Inc + contributors */
(function(riot) { "use strict";

riot.observable = function(el) {
  var callbacks = {}, slice = [].slice;

  el.on = function(events, fn) {
    if (typeof fn === "function") {
      events.replace(/[^\s]+/g, function(name, pos) {
        (callbacks[name] = callbacks[name] || []).push(fn);
        fn.typed = pos > 0;
      });
    }
    return el;
  };

  el.off = function(events, fn) {
    if (events === "*") callbacks = {};
    else if (fn) {
      var arr = callbacks[events];
      for (var i = 0, cb; (cb = arr && arr[i]); ++i) {
        if (cb === fn) arr.splice(i, 1);
      }
    } else {
      events.replace(/[^\s]+/g, function(name) {
        callbacks[name] = [];
      });
    }
    return el;
  };

  // only single event supported
  el.one = function(name, fn) {
    if (fn) fn.one = true;
    return el.on(name, fn);
  };

  el.trigger = function(name) {
    var args = slice.call(arguments, 1),
      fns = callbacks[name] || [];

    for (var i = 0, fn; (fn = fns[i]); ++i) {
      if (!fn.busy) {
        fn.busy = true;
        fn.apply(el, fn.typed ? [name].concat(args) : args);
        if (fn.one) { fns.splice(i, 1); i--; }
        fn.busy = false;
      }
    }

    return el;
  };

  return el;

};
var FN = {}, // Precompiled templates (JavaScript functions)
  template_escape = {"\\": "\\\\", "\n": "\\n", "\r": "\\r", "'": "\\'"},
  render_escape = {'&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;'};

function default_escape_fn(str, key) {
  return str == null ? '' : (str+'').replace(/[&\"<>]/g, function(char) {
    return render_escape[char];
  });
}

riot.render = function(tmpl, data, escape_fn) {
  if (escape_fn === true) escape_fn = default_escape_fn;
  tmpl = tmpl || '';

  return (FN[tmpl] = FN[tmpl] || new Function("_", "e", "return '" +
    tmpl.replace(/[\\\n\r']/g, function(char) {
      return template_escape[char];
    }).replace(/{\s*([\w\.]+)\s*}/g, "' + (e?e(_.$1,'$1'):_.$1||(_.$1==null?'':_.$1)) + '") + "'")
  )(data, escape_fn);
};

riot.route = (function() {
  var map = {},
      paramsRegEx = /\{\w+\}/g,
      paramsReplace = "(\\w+)",
      escapeRegEx  = /[\/\=\?\$\^]/g,
      escapeReplace = "\\$&";

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

    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      matchKeys = key.match(paramsRegEx);
      regex = key
        .replace(escapeRegEx, escapeReplace)
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
  } else if (document.attachEvent) {
    document.attachEvent("onreadystatechange", function() {
      if (document.readyState === "complete") riot.route.trigger("load");
    });
  }
}
})(typeof window !== "undefined" ? window.riot = {} : exports);
