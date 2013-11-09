/*
  Riot.js templating 0.9.4 | moot.it/riotjs | @license MIT
  (c) 2013 Tero Piirainen, Moot Inc and other contributors.
 */
(function() {

  // Precompiled templates (JavaScript functions)
  var FN = {};

  // Render a template with data
  $.render = function(template, data) {
    return !template ? '' : (FN[template] = FN[template] || new Function("_",
      "return '" + template
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/'/g, "\\'")
        .replace(/\{\s*(\w+)\s*\}/g, "' + (_.$1 === undefined || _.$1 === null ? '' : _.$1) + '") +
      "'"
    ))(data);
  }

})()