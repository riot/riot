
<loop-child>

  <looped-child name={ name } each={ items }></looped-child>

  this.items = [ {name: 'one'}, {name: 'two'} ]

</loop-child>


<looped-child>

  <button onclick={ hit }>{ opts.name }</button>

  hit(e) {
    console.info(e.target)
  }

</looped-child>
