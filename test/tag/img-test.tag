
<img-test>

  <img src={ src }>

  var self = this

  setTimeout(function() {
    self.update({ src: 'http://cdn.muut.me/sprite.png' })
  }, 100)

  setTimeout(function() {
    self.update({ src: '' })
  }, 200)

</img-test>