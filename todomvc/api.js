/**
 * define the class for every item
 */
function TodoItem(item) {
  // Generate id if not given
  item.id = item.id || ("_" + ("" + Math.random()).slice(2));
  // extend self
  var self = $.observable($.extend(this, item))
  
  self.update = function(name){
    self.name = name;
    self.trigger('update')
  }
  
  self.toggle = function(){
    self.done = !self.done;
    self.trigger('toggle')
  }
}
/**
 * define the class for todolist
 */
function TodoList(db){
  
  db = db || DB("todolist-riot"), self = $.observable(this)
  
  // @param filter: <empty>, id, "active", "completed"
  // @param onlydata: true, false
  self.items = function (filter, onlydata) {
    var ret = [];
    $.each(this, function(id, item) {
      if (item && item.id && (!filter || filter == id || filter == (item.done ? "completed" : "active"))) 
        ret.push(onlydata? {id: item.id, name: item.name, done: item.done}: item)
    })
    return ret;
  }
  
  self.save = function (){
    db.put(this.items(false, true))
  }
  
  self.additem = function (item){
    var todo = new TodoItem(item);
    self.trigger('additem', self[todo.id] = todo)
    return todo
  }
  
  // using "one", means just init the list once.
  self.one('init', function(){ 
    // init item list from db
    return $.each(db.get(), function(id, item) {
      self.additem(item)
    })
  })
  
  self.show = function(filter){
    return $.each(todolist.items(filter), function (i,n){
      n.trigger('add')
    }) 
  }
}
