// Precompiled templates (JavaScript functions)
var FN = {},
  escape_fn = function(data) {
    return (data || data === 0) ? (data+'').replace(
      /[&\"<>]/g,
      function(e){ return render_escape[e];}
    ): '';
  },
  no_escape_fn = function(data) {
    return (data || data === 0) ? (data+'') : '';
  },
  template_escape = {"\\": "\\\\", "\n": "\\n", "\r": "\\r", "'": "\\'"},
  render_escape = {'&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;'};

$.render = function(tmpl, data) {
  return (FN[tmpl] = FN[tmpl] || new Function("_", "e", "n", "return '" +
    tmpl
      .replace(
        /[\\\n\r']/g,
        function(escape) { return template_escape[escape]; }
      )
      .replace(
        /{\$\s*([\w\.]+)\s*}/g,
        "'+(function(){try{return n(_.$1)}catch(e){return ''}})()+'"
      )
      .replace(
        /{\s*([\w\.]+)\s*}/g,
        "'+(function(){try{return e(_.$1)}catch(e){return ''}})()+'"
      ) + "'"
  ))(data, escape_fn, no_escape_fn);
};
