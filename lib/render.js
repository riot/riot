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

$.render = function(tmpl, data, esc) {
  var fn_tpl = (esc === false) ? '' : '$1e';
  esc = (typeof esc == 'function') ? esc : (esc === false) ? no_escape_fn : escape_fn;
  tmpl = tmpl ? tmpl : '';
  
  return (FN[tmpl] = FN[tmpl] || new Function("_", "e", "$e", "return '" +
    tmpl
      .replace(
        /[\\\n\r']/g,
        function(escape) { return template_escape[escape]; }
      )
      .replace(
        /{(\$?)\s*([\w\.]+)\s*}/g,
        "'+(function(){try{return "+fn_tpl+"(_.$2)}catch(e){return ''}})()+'"
      ) + "'"
  ))(data, esc, no_escape_fn);
};
