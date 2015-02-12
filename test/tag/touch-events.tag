
<touch-events>

  <div ontouchstart={ fn } ontouchmove={ fn } ontouchend={ fn }>
    <h3>Touch me, touch me.</h3>
  </div>

  <div id="info" onclick={ clear }></div>

  fn(e) {
    this.info.innerHTML += e.type + '<br>'
  }

  clear() {
    this.info.innerHTML = ''
  }

</touch-events>