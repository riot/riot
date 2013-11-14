/*
  Riot.js templating | moot.it/riotjs | license: MIT
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
        .replace(/\{\s*(\w+)\s*\}/g, "' + (_.$1 ? (_.$1 + '').replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : (_.$1 === 0 ? 0 : '')) + '") +
      "'"
    ))(data);
  }

})()
