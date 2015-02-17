riot.tag('style-test', '<h3>{ opts.title }</h3>', 'style-test { display: block; border: 2px }', function(opts) {
  this.foo = function() {

    this.update()
  }.bind(this);

});