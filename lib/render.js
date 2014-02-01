
// Precompiled templates (JavaScript functions)
var FN = {};

// Render a template with data
$.render = function(template, data) {
  if(!template) return '';

  FN[template] = FN[template] || function(data) {
    function escaper(_){
      return _.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/\"/, '&quot;');
    }

    function replacer(_, match){
      return escaper(data[match]===0?'0':data[match]?data[match]:'')
    }

    data = data ? data : {};
    return template.replace(/\{\s*(\w+)\s*}/g, replacer);
  };

  return FN[template](data);
};
