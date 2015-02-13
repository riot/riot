
<if-child>
  <p>A child</p>
  <h3>And some more</h3>

  this.on('mount unmount', function(e) {
    // console.info(this, e)
  })
</if-child>

<if-test>

  <p>before</p>
  <p if={ flag }>COND</p>

  <p>after</p>

  <p each={ num, i in nums} if={ num == parent.flag }>{ num }</p>

  <if-child show={ flag } />

  // this.flag = true
  var self = this

  this.nums = [1, 2, 3]

  setTimeout(function() {
    self.update({ flag: true })
  }, 300)


</if-test>