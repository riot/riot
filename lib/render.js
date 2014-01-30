
// Precompiled templates (JavaScript functions)
var FN = {};

// Render a template with data
$.render = function(template, data) {
  if(!template) return '';

  // sanitize template
  template = template.replace(/\u2028|\u2029/g, '\n')
                     .replace('\\x', '\\\\x')
                     .replace('\\u', '\\\\u')
                     ;

  FN[template] = FN[template] || new Function("_",
    "return '" + template
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/'/g, "\\'")
      .replace(/\{\s*(\w+)\s*\}/g, "'+(_.$1?(_.$1+'').replace(/&/g,'&amp;').replace(/\"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):(_.$1===0?0:''))+'") + "'"
  );

  return FN[template](data);
};

