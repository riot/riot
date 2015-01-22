
riot.tag('todo', '<h3>{ opts.title }</h3> <ul> <li each="{ items }"> <label class="{ completed: done }"> <input type="checkbox" __checked="{ done }" onclick="{ parent.toggle }"> { title } </label> </li> </ul> <form onsubmit="{ add }"> <input name="input" onkeyup="{ edit }"> <button __disabled="{ !text }">Add #{ items.length + 1 }</button> </form>', function(opts) {
  this.disabled = true

  this.items = opts.items

  this.edit = function(e) {
    this.text = e.target.value
  }.bind(this)

  this.add = function(e) {
    if (this.text) {
      this.items.push({ title: this.text })
      this.text = this.input.value = ''
    }
  }.bind(this)

  this.toggle = function(e) {
    var item = e.item
    item.done = !item.done
    return true
  }.bind(this)

})