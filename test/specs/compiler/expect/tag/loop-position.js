
riot.tag('loop-position', '<p> <span each="{ items }">{ x }</span> </p> <h3>between</h3> <p> <span each="{ items }">{ x }</span> </p>', function(opts) {

  this.items = [{ x: '1 ' }, { x: '2 ' }]

  setTimeout(function() {
    this.items.push({ x: 'third' })
    this.update()

  }.bind(this), 200)


});