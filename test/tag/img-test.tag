
<img-test>

  <img src={ src }>

  var self = this

  setTimeout(function() {
    self.update({ src: '../doc/logo/riot60x.png' })
  }, 10)

  setTimeout(function() {
    self.update({ src: '' })
  }, 2000)

</img-test>