riot.tag2('mixed-js', '<h3>Mixed JavaScript Types</h3>', '', '', function(opts) {
  getES6() {
    return `es6`
  }

  this.getRiot = function() {
    return 'riotjs'
  }.bind(this)
});