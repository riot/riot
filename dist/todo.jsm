
var Todo = function() {

  // HTML can be placed anywhere inside the function (top, bottom, middle)

  riot.view('<div style="color: { items.length ? \'red\' : \'green\' }"><h3 class="{ is_disabled: disabled }"> { test ? "kama" : "jama" } { test } jotain { rand() } </h3><form onsubmit="{ add }"><input type="text" name="title" placeholder="What needs to bd done?" value="Test"><button disabled="{ disabled }">Add # { items.length + 1 }</button></form><ul skip name="items"></ul></div>', this);

  var self = this,
      el;

  self.render(function(_el) {
    el = _el;
  });

  self.items = [];

  self.test = 50;

  self.disabled = false;

  self.rand = function() {
    return 4 * 60;
  };

  self.add = function(e) {
    console.info("jooo", el.items);
    e.preventDefault();

    // create new task
    var task = new Task(this.title.value);
    self.items.push(task);

    task.render(el.items, self);
  };

};

