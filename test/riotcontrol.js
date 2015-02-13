var RiotControl = {
  _stores: [],
  addStore: function(store) {
    this._stores.push(store);
  }
};

['on','one','off','trigger'].forEach(function(api){
  RiotControl[api] = function() {
    var args = [].slice.call(arguments);
    this._stores.forEach(function(el){
      el[api].apply(null, args);
    });
  };
});

if (typeof(module) !== 'undefined') module.exports = RiotControl;
