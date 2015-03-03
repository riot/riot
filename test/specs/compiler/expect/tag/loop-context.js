
riot.tag('loop-context', '<li each="{ items }"> <a onclick="{ parent.toggle }">{ title }</a> <a onclick="{ parent.remove }">remove</a> <a onclick="{ fn }">fn</a> <span if="{ done }">{ parent.rand }</span> </li> <button onclick="{ random }">Set random</button>', function(opts) {

  var self = this

  this.items = [
    { title: 'Existing #1', done: true },
    { title: 'Existing #2', fn: function() {
      self.items[2].title = 'kissala'
      self.update()
    }}
  ]

  this.toggle = function(e) {
    var item = e.item
    item.done = !item.done
  }.bind(this);

  this.remove = function(e) {
    var i = self.items.indexOf(e.item)
    self.items.splice(i, 1)
  }.bind(this);

  this.random = function() {
    self.rand = ('' + Math.random()).slice(10)
  }.bind(this);

  this.random()

  setTimeout(function() {
    self.items.unshift({ title: 'Top #1' })
    self.items.push({ title: 'Bottom #new' })
    self.update()

  }, 100)


});