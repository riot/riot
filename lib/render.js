
var FN = {}, // Precompiled templates (JavaScript functions)
  template_escape = {"\\": "\\\\", "\n": "\\n", "\r": "\\r", "'": "\\'"},
  render_escape = {'&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;'};

function escape(str) {
  return str == undefined ? '' : (str+'').replace(/[&\"<>]/g, function(char) {
    return render_escape[char];
  });
}

$.render = function(tmpl, data, escape_fn) {
  if (typeof escape_fn != 'function' && escape_fn !== false) escape_fn = escape;
  tmpl = tmpl || '';

  return (FN[tmpl] = FN[tmpl] || new Function("_", "e", "return '" +

    tmpl.replace(/[\\\n\r']/g, function(char) {
      return template_escape[char];

    }).replace(/{\s*([\w\.]+)\s*}/g, "'+(function(){try{return e?e(_.$1):_.$1}catch(e){return ''}})()+'") + "'"

  ))(data, escape_fn);

};
