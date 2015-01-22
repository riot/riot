
var Task = function(title, completed) {

  riot.view('<li><div class="{ is_completed: completed, editing: editing }"><h3>Entry: { title }</h3><input type="checkbox" onchange="{ toggle }" checked="{ completed }"><label ondoubleclick="{ edit }">{ title }</label><button class="destroy" onclick="{ destroy }">Destroy</button></div><input class="edit" value="{ title }"></li>', this);

  var self = this,
      el;

  self.render(function(_el) {
    el = _el;
  });

  self.completed = true;

  self.title = title;

  self.toggle = function() {
    self.completed = !self.completed;
  };

  self.destroy = function() {
    el.parent.items = el.parent.items.slice(0, -1);
    el.root.parentNode.removeChild(el.root);
  };

  self.edit = function() {
    self.editing = true;
  };

};

