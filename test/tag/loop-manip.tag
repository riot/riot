
<loop-manip>

  <li each={ item in items }>
    { item.title } <a onclick={ parent.remove }>remove</a>
  </li>

  <button onclick={ top }>Top</button>
  <button onclick={ bottom }>Bottom</button>

  this.items = [{ title: 'First' }, { title: 'Second' }]

  bottom(e) {
    this.items.push({ title: Math.random() })
  }

  top() {
    this.items.unshift({ title: Math.random() })
  }

  remove(e) {
    var i = this.items.indexOf(e.item.item)
    this.items.splice(i, 1)
  }

</loop-manip>