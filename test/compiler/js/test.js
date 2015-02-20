riot.tag('kids', '<h3 foo="{ test }"></h3>', function(opts) {

  this.foo = function() {

    this.update()
  }.bind(this);

});