
riot.tag('loop-manip', '<li each="{ item, i in items }"> { item } <a onclick="{ parent.remove }">remove</a> </li> <button onclick="{ top }">Top</button> <button onclick="{ bottom }">Bottom</button>', function(opts) {

  this.items = [0,1,2,3,4,5]

  this.bottom = function(e) {
    this.items.push(100)
  }.bind(this);

  this.top = function() {
    this.items.unshift(100)
  }.bind(this);

  this.remove = function(e) {
    this.items.splice(e.item.i, 1)
  }.bind(this);


});
