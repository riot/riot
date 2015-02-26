
<loop-child>

  <looped-child el={ this } each={ items }></looped-child>

  this.items = [ {name: 'one'}, {name: 'two'} ]

</loop-child>


<looped-child>

  <button onclick={ hit }>{ opts.el.name }</button>

  hit(e) {
    console.info(e.target)
  }

</looped-child>
