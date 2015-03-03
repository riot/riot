
riot.tag('touch-events', '<div ontouchstart="{ fn }" ontouchmove="{ fn }" ontouchend="{ fn }"> <h3>Touch me, touch me.</h3> </div> <div id="info" onclick="{ clear }"></div>', function(opts) {

  this.fn = function(e) {
    this.info.innerHTML += e.type + '<br>'
  }.bind(this);

  this.clear = function() {
    this.info.innerHTML = ''
  }.bind(this);


});