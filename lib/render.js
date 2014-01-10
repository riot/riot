
// Precompiled templates (JavaScript functions)
Riot.templates = {};

// Render a template with data
Riot.render = function(template, data) {
  if(!template) return '';

  Riot.templates[template] = Riot.templates[template] || new Function("_",
    "return '" + template
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/'/g, "\\'")
      .replace(/\{\s*(\w+)\s*\}/g, "'+(_.$1?(_.$1+'').replace(/&/g,'&amp;').replace(/\"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):(_.$1===0?0:''))+'") + "'"
  );

  return Riot.templates[template](data);
};

