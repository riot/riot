
<loop-replace>

  <div>
    <span>before</span>
    <strong each="{ items }">{ v }</strong>
    <span>after</span>
  </div>

  var self = this
  self.items = [ { v: 'a' }, { v: 'b' } ]

  setTimeout(function() { self.update({ items: [ {v:'c'}, {v:'d'} ] }) }, 200)
  setTimeout(function() { self.items = [ {v:'e'}, {v:'f'} ]; self.update() }, 400)

</loop-replace>