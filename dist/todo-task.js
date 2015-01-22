
riot.html['todo-item'] = function(root, data) {

  riot.view('<li> <div class="{ is_completed: completed, editing: editing }"> <h3>Entry: { title }</h3> <input type="checkbox" onchange="{ toggle }" checked="{ completed }"> <label ondoubleclick="{ edit }">{ title }</label> <button class="destroy" onclick="{ destroy }">Destroy</button> </div> <input class="edit" value="{ title }"> </li>', this);

  var self = this;


  self.title = data.title;

  self.toggle = function() {
    self.completed = !self.completed;
  };

  self.destroy = function() {
    data.parent.items = data.parent.items.slice(0, -1);
  };

  self.edit = function() {
    self.editing = true;
  };

};

