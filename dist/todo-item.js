
riot.tag('todo-item', '<li> <div class="{ is_completed: completed, editing: editing }"> <h3>Entry: { title }</h3> <input type="checkbox" onchange="{ toggle }" checked="{ completed }"> <label ondoubleclick="{ edit }">{ title }</label> <button class="destroy" onclick="{ destroy }">Destroy</button> </div> <input class="edit" value="{ title }"> </li>', function(opts) {


  // this.title = opts.data.title

  this.toggle = (function() {
    this.completed = !this.completed
  }).bind(this)

  this.edit = (function() {
    this.editing = true
  }).bind(this)

  this.destroy = (function() {

  }).bind(this)


}

