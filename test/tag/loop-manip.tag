
<loop-manip>

  <ul>
    <li each={ item, i in items }>{ item } <a onclick={ parent.remove }>remove</a></li>
  </ul>

  <button onclick={ top }>Top</button>
  <button onclick={ bottom }>Bottom</button>

  this.items = [0,1,2,3,4,5]

  bottom(e) {
    this.items.push(100)
  }

  top() {
    this.items.unshift(100)
  }

  remove(e) {
    this.items.splice(e.item.i, 1)
  }

</loop-manip>
