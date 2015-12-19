
<loop-child>

  <looped-child el={ this } each={ items }></looped-child>

  this.items = [ {name: 'one'}, {name: 'two'} ]
  this.childrenMountWidths = []
  this.childrenUpdatedWidths = []

  getWidth(el) {
    if (el.root.getBoundingClientRect)
      return el.root.getBoundingClientRect().width
    else
      return 0
  }

  this.on('updated', function() {
    this.tags['looped-child'].forEach(function(child) {
      this.childrenUpdatedWidths.push(this.getWidth(child))
    }.bind(this))
  })

  this.on('mount', function() {
    this.tags['looped-child'].forEach(function(child) {
      this.childrenMountWidths.push(this.getWidth(child))
    }.bind(this))
  })

</loop-child>


<looped-child style="color: { color };">

  <h3>{ opts.el.name }</h3>
  <button onclick={ hit }>{ opts.el.name }</button>

  this.color = 'red'

  this.on('updated', function() {
    this.updatedWidth = this.parent.getWidth(this)
  })

  this.on('mount', function() {
    this.mountWidth = this.parent.getWidth(this)
  })

  hit(e) {
    this.color = 'blue'
  }

</looped-child>
