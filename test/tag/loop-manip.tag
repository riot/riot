
<loop-manip>

  <li each={ items }>
    { title } <a onclick={ parent.remove }>remove</a>
  </li>

  <button onclick={ top }>Top</button>
  <button onclick={ bottom }>Bottom</button>

  var self = this

  this.items = [{ title: 'First' }, { title: 'Second' }]

  bottom() {
    this.items.push({ title: Math.random() })
  }

  top() {
    this.items.unshift({ title: Math.random() })
  }

  remove(e) {
    var i = self.items.indexOf(e.item)
    self.items.splice(i, 1)
  }

</loop-manip>