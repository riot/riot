
<loop-replace>

  <div>
    <span>before</span>
    <strong each="{ items }">{ v }</strong>
    <span>after</span>
  </div>

  var self = this
  self.items = [ { v: 'a' }, { v: 9 }, { v: 338 } ]

  setTimeout(function() { self.update({ items: [ { v:'c'}, {v:'d'} ] }) }, 200)
  setTimeout(function() { self.update({ items: [ {v:'e'}, {v:'f'} ] }) }, 400)

</loop-replace>