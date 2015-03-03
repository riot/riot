
riot.tag('loop-manip', '<li each="{ item in items }"> { item.title } <a onclick="{ parent.remove }">remove</a> </li> <button onclick="{ top }">Top</button> <button onclick="{ bottom }">Bottom</button>', function(opts) {

  this.items = [{ title: 'First' }, { title: 'Second' }]

  this.bottom = function(e) {
    this.items.push({ title: Math.random() })
  }.bind(this);

  this.top = function() {
    this.items.unshift({ title: Math.random() })
  }.bind(this);

  this.remove = function(e) {
    var i = this.items.indexOf(e.item.item)
    this.items.splice(i, 1)
  }.bind(this);


});