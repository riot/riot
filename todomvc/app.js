/* The presenter */

(function() { 'use strict';
  /*
    A Model instance exposed to global space so you can
    use the TodoList APi from the console. For example:

    todolist.add("My task");
  */
  var todolist = window.todolist = new TodoList();

  // HTML for a single todo item
  var template = $("[type='html/todo']").html(),
    root = $("#todo-list"),
    nav = $("#filters a");

  /* 
    bind callback for event "additem" on todolist
    in this callback add the browser events to the current view (just render by the todoitem)
  */
  todolist.on('additem', function(item){
    var el, input, tbtn, label, dbtn, blur = function (){el.removeClass("editing")};

    /* Listen to model events */
    /* bind "add", "remove", "toggle", "update" event to TodoItem. */
    item.on("add", function (){
      el = $($.render(template, item)).addClass(item.done ? "completed" : "").appendTo(root);
      input = $(".edit", el); tbtn = $(".toggle", el); label = tbtn.next(); dbtn = label.next();    
      // bind "click" event to checkbox
      tbtn.click(function(){ item.toggle() })
      // bind the "dblclick" event to edit the current item.
      label.dblclick(function (){
        el.addClass("editing");
        input.focus()[0].select();
      })
      // bind "click" event to remove button to remove the current item.
      dbtn.click(function(){ item.trigger('remove') });
      // bind "blur" and "keydown" event to edit the current item.
      input.blur(blur).keydown(function(e) {
        var val = $.trim(this.value);
        if (e.which == 13 && val) {
          item.update(val);
        }
        if (e.which == 27) blur()
      })
    }).on("remove", function() {
      el.remove()
      delete todolist[item.id]
    }).on("toggle", function() { 
      el.toggleClass("completed", !!item.done);
      tbtn.prop("checked", !!item.done);
    }).on("update", function() {
      el.removeClass("editing");
      $("label, .edit", el).text(item.name).val(item.name);
    }).on("add remove toggle", function(){
      var active = todolist.items("active").length, done = todolist.items("completed").length;
      $("#todo-count").html("<strong>" +active+ "</strong> item" +(active == 1 ? "" : "s")+ " left")
      $("#clear-completed").toggle(done > 0).text("Clear completed (" + done + ")")
      $("#footer").toggle(active + done > 0)
    }).on("add remove update toggle", function(){
      todolist.save()
    });
  })

  /* Listen to user events */

  $("#new-todo").keyup(function(e) {
    var val = $.trim(this.value);
    if (e.which == 13 && val) {
      todolist.additem({name: val, done:false}).trigger('add')
      this.value = "";
    }
  })

  $("#toggle-all").click(function() {
    $("li", root).each(function() {
      todolist[this.id].toggle();
    })
  })

  $("#clear-completed").click(function() {
    $.each(todolist.items("completed"), function(i,n){
      n.trigger('remove')
    })
  })

  /* Routing */

  nav.click(function() {
    return $.route($(this).attr("href"))
  })

  $.route(function(hash) {
    // clear list and add new ones
    root.empty() && todolist.trigger('init').show(hash.slice(2))
    // selected class
    nav.removeClass("selected").filter("[href='" + hash + "']").addClass("selected");
  })
})()
