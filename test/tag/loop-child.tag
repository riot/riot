
<loop-child>

  <looped-child el={ this } each={ items }></looped-child>

  this.items = [ {name: 'one'}, {name: 'two'} ]
  this.childrenMountWidths = []
  this.childrenUpdatedWidths = []

  this.on('updated', function() {
    this.tags['looped-child'].forEach(function(child) {
      this.childrenUpdatedWidths.push(child.root.getBoundingClientRect().width)
    }.bind(this))
  })

  this.on('mount', function() {
    this.tags['looped-child'].forEach(function(child) {
      this.childrenMountWidths.push(child.root.getBoundingClientRect().width)
    }.bind(this))
  })

</loop-child>


<looped-child style="color: { color };">

  <h3>{ opts.el.name }</h3>
  <button onclick={ hit }>{ opts.el.name }</button>

  this.color = 'red'

  this.on('updated', function() {
    this.updatedWidth = this.root.getBoundingClientRect().width
  })

  this.on('mount', function() {
    this.mountWidth = this.root.getBoundingClientRect().width
  })

  hit(e) {
    this.color = 'blue'
  }

</looped-child>
