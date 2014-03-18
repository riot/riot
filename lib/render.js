
// Precompiled templates (JavaScript functions)
var FN = {};

var ESCAPING_MAP = {
  "\\": "\\\\",
  "\n": "\\n",
  "\r": "\\r",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
  "'": "\\'"
};

var ENTITIES_MAP = {
  '&': '&amp;',
  '"': '&quot;',
  '<': '&lt;',
  '>': '&gt;'
};

// Render a template with data
$.render = function(template, data) {
  if(!template) return '';

  FN[template] = FN[template] || new Function(
    "_",
    "return '" + template
      .replace(
        /[\\\n\r\u2028\u2029']/g,
        function(escape) { return ESCAPING_MAP[escape]; }
      ).replace(
        /\{\s*(\$?)([\.\w]+)\s*\}/g,
        "'+(function(){try{return(typeof(_.$2)!=='undefined'?$$.render.encode(_.$2,'$1'):'')}catch(e){return ''}})()+'"
      )+"'"
  );

  return FN[template](data);
};

// Encode entities
$.render.encode = function (value, prefix) {
  var str = (value===null || value===false) ? '' : value+'';
  if (prefix==='$') { return str; }
  return str.replace(/[&\"<>]/g, function(e) { return ENTITIES_MAP[e]; })
};
