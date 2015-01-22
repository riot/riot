
riot.tag('simple-todo', '<h3>TODO</h3> <ul> <li each="{ item, i in items }">{ item }</li> </ul> <form onsubmit="{ add }"> <input autofocus> <button>Add #{ items.length + 1 }</button> </form>', function(opts) {
  this.items = []

  this.add = function(e) {
    var input = e.target[0],
        value = input.value.trim()

    if (value) this.items.push(value)
    input.value = ''
  }

})