
<loop-context>

  <li each={ items }>
    <a onclick={ toggle }>{ title }</a>
    <a onclick={ remove }>remove</a>
    <a onclick={ fn }>fn</a>
    <span if={ done }>{ parent.rand }</span>
  </li>

  <button onclick={ random }>Set random</button>

  var self = this

  this.items = [
    { title: 'Existing #1', done: true },
    { title: 'Existing #2', fn: function() {
      self.items[2].title = 'kissala'
      self.update()
    }}
  ]

  toggle(e) {
    var item = e.item
    item.done = !item.done
  }

  remove(e) {
    var i = self.items.indexOf(e.item)
    self.items.splice(i, 1)
  }

  random() {
    self.rand = ('' + Math.random()).slice(10)
  }

  this.random()

  // add new items
  setTimeout(function() {
    self.items.unshift({ title: 'Top #1' })
    self.items.push({ title: 'Bottom #new' })
    self.update()

  }, 100)

</loop-context>