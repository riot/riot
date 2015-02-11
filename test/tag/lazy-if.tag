
<lazy-if>

  <ul if={ flag }>
    <li each={ el in items }>{ el }</li>
  </ul>

  var self = this
  this.items = [1, 2]

  setTimeout(function() {
    self.items.push(3)
    self.update({ flag: true })
  }, 10)

</lazy-if>

