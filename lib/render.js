
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

  FN[template] = FN[template] || new Function("_", "E",
    "return '" + template
      .replace(
        /[\\\n\r\u2028\u2029']/g,
        function(escape) { return ESCAPING_MAP[escape]; }
      ).replace(
        /\{\s*([\.\w]+)\s*\}/g,
        "'+(function(){try{return(typeof(_.$1)!=='undefined'&&_.$1!==null?(_.$1+'').replace(/[&\"<>]/g,function(e){return E[e];}):'')}catch(e){return ''}})()+'"
      )+"'"
  );

  return FN[template](data, ENTITIES_MAP);
};

