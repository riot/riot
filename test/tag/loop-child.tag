
<loop-child>

  <looped-child el={ this } each={ items }></looped-child>

  this.items = [ {name: 'one'}, {name: 'two'} ]

</loop-child>


<looped-child style="color: { color };">

  <h3>{ opts.el.name }</h3>
  <button onclick={ hit }>{ opts.el.name }</button>

  this.color = 'red'

  hit(e) {
    this.color = 'blue'
  }

</looped-child>
