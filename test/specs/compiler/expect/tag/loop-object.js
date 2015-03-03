
riot.tag('loop-object', '<h3>Object loop</h3> <div> <p each="{ key, value in obj }">{ key } = { value }</p> </div>', function(opts) {

  this.obj = { zero: 0, one: 1, two: 2, three: 3 }

  var self = this

  setTimeout(function() {
    self.obj.zero = 'zero'
    self.obj.two = 'two'
    self.update()
  }, 200)


});