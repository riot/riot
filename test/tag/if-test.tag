
<if-child>
  <h3>Child tag</h3>
</if-child>

<if-test>

  <p>before</p>
  <p if={ flag }>COND</p>

  <p>after</p>

  <p each={ num, i in nums} if={ num == parent.flag }>{ num }</p>

  <p>
    <if-child show={ flag } />
  </p>

  // this.flag = true
  var self = this

  this.nums = [1, 2, 3]

  setTimeout(function() {
    self.update({ flag: true })
  }, 300)


</if-test>