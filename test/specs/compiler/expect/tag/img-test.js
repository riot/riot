
riot.tag('img-test', '<img riot-src="{ src }">', function(opts) {

  var self = this

  setTimeout(function() {
    self.update({ src: '../doc/logo/riot60x.png' })
  }, 10)

  setTimeout(function() {
    self.update({ src: '' })
  }, 2000)


});