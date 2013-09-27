
function Todo(db) {

   db = db || DB("todos-jmvc");

   var self = $.emitter(this),
      items = db.get();

   self.add = function(name) {
      var item = { id: ("" + Math.random()).slice(2), name: name }
      items[item.id] = item;
      self.emit("add", item);
   }

   self.edit = function(item) {
      items[item.id] = item;
      self.emit("edit", item);
   }

   self.remove = function(filter) {
      var els = self.items(filter);
      $.each(els, function() {
         delete items[this.id]
      })
      self.emit("remove", els);
   }

   self.toggle = function(filter, flag) {
      var els = self.items(filter);
      $.each(els, function() {
         items[this.id].done = !items[this.id].done;
      })
      self.emit("toggle", els, filter);
   }

   // @param filter: <empty>, "active", "completed"
   self.items = function(filter) {
      var ret = [];
      $.each(items, function(id, item) {
         if (!filter || parseInt(filter) == id || filter == (item.done ? "completed" : "active")) ret.push(item)
      })
      return ret;
   }

   // sync database
   self.on("add remove toggle edit", function() {
      db.put(items);
   })

}