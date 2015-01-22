
<loop-nested>

  <h3>Nested object loop</h3>

  <div class="cat" each="{ cat, items in menu }">

    <h4>{ cat }</h4>

    <p each="{ key, plan in items }">{ key } -> { plan }</p>

  </div>

  var self = this

  this.menu = {
    Branding: { first: 'mini', second: 'small', third: 'med' },
    Shooting: { eka: 'mini', toka: 'small', kolmas: 'big' }
  }

</loop-nested>