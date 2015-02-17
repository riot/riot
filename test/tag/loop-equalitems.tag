
<loop-equalitems>
  <h3>Equal items / reordering with pos values</h3>

  <h4>The loop:</h4>
  <span each="{name, i in items}">{name}({i}) </span>

  <h4>Should be:</h4>
  <p>{shouldbe}</p>

  this.shouldbe = '1(0) 2(1) 3(2) 3(3) 4(4) 5(5) 5(6) 6(7)'
  this.items = [1, 2, 3, 3, 4, 5, 5, 6]

  setInterval(function() {
    this.items.sort(function () {
      return Math.round(Math.random()*2-1)
    })
    this.shouldbe = this.items.map(function (item, i) {return item + '('+i+')'}).join(' ')
    this.update()

  }.bind(this), 2000)

</loop-equalitems>
