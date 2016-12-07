<show-bug-2125>
  <show-bug-2125-child each={item in items} show={ store.selected == item.id } item={item}/>
  this.store = {selected: 'one'}
  this.items = [
    {id: 'one'},
    {id: 'two'}
  ]
</show-bug-2125>

<show-bug-2125-child>
  <h1>{item.id}</h1>
</show-bug-2125-child>