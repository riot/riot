
<inner-html>

  <h3>Tag title</h3>

  var h3 = this.root.firstChild,
      self = this

  self.on('mount', function() {
    self.root.appendChild(h3)
  })

</inner-html>