
riot.tag('if-child', '<h3>Child tag</h3>', function(opts) {

});

riot.tag('if-test', '<p>before</p> <p if="{ flag }">COND</p> <p>after</p> <p each="{ num, i in nums}" if="{ num == parent.flag }">{ num }</p> <p> <if-child show="{ flag }"></if-child> </p>', function(opts) {
  var self = this

  this.nums = [1, 2, 3]

  setTimeout(function() {
    self.update({ flag: true })
  }, 300)



});