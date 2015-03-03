
riot.tag('loop-reorder', '<h3>Object loop reordering</h3> <h4>The loop:</h4> <span each="{items}">{x} </span> <h4>Should be:</h4> <p>{shouldbe}</p>', function(opts) {

  this.shouldbe = '1 2 3 4 5 6'
  this.items = [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }, { x: 5 }, { x: 6 }]

  setInterval(function() {
    this.items.sort(function () {
      return Math.round(Math.random()*2-1)
    })
    this.shouldbe = this.items.map(function (item) {return item.x}).join(' ')
    this.update()

  }.bind(this), 1000)


});
