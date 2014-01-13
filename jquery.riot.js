/*
	Riot.js 0.9.7 | moot.it/riotjs | @license MIT
	(c) 2013 Tero Piirainen, Moot Inc and other contributors.
*/
(function($) { "use strict";

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

// Precompiled templates (JavaScript functions)
var FN = {};

// Render a template with data
$.render = function(template, data) {
  if(!template) return '';

  FN[template] = FN[template] || new Function("_",
    "return '" + template
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/'/g, "\\'")
      .replace(/\{\s*(\w+)\s*\}/g, "'+(_.$1?(_.$1+'').replace(/&/g,'&amp;').replace(/\"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):(_.$1===0?0:''))+'") + "'"
  );

  return FN[template](data);
};


// browsers only
if (typeof top != "object") return;

// cross browser popstate
var currentHash,
  pops = $.observable({}),
  listen = window.addEventListener,
  doc = document;

function pop(hash) {
  hash = hash.type ? location.hash : hash;
  if (hash != currentHash) pops.trigger("pop", hash);
  currentHash = hash;
}

if (listen) {
  listen("popstate", pop, false);
  doc.addEventListener("DOMContentLoaded", pop, false);

} else {
  doc.attachEvent("onreadystatechange", function() {
    if (doc.readyState === "complete") pop("");
  });
}

// Change the browser URL or listen to changes on the URL
$.route = function(to) {
  // listen
  if (typeof to === "function") return pops.on("pop", to);

  // fire
  if (history.pushState) history.pushState(0, 0, to);
  pop(to);

};})(typeof top == "object" ? window.$ || (window.$ = {}) : exports);
