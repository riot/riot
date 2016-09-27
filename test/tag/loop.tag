<loop>
  <ul>
    <li each="{ item, i in items }" onclick="{ parent.opts.onItemClick }">{ i } { item.value } </li>
  </ul>
  <dl>
    <dt each="{ this.removes }" onclick="{ parent.opts.removeItemClick }">{ value } </dt>
  </dl>
  <button onclick={ addSomeItems }>btn</button>

  this.items = []

  addSomeItems(e) {
    var amount = 5
    while(amount--){
      this.items.push({value: "item #" + this.items.length})
    }
  }
</loop>
