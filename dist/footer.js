
riot('footer', '<p onclick="{ test }">Going to add some { stuff }</p>', function(data) {

  var self = this;

  self.stuff = "random stuff: " + Math.random();

  self.test = function() {
    alert("Hello HTML!")
  }

});
