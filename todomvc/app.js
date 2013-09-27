
/* The presenter */

(function() { 'use strict';

   /*
      A Model instance.
      Can be used from browser's console. Try for example:

      todo.add("My task");
   */
   window.todo = new Todo();

   // HTML for a sintle todo item
   var template = $("#todo-tmpl").html(),
      root = $("#todo-list"),
      els = {},
      filter;

   // actions call model methods
   $("#new-todo").keyup(function(e) {
      var val = $.trim(this.value);
      if (e.which == 13 && val) {
         todo.add(val);
         this.value = "";
      }
   })

   $("#toggle-all").click(function() {
      todo.toggle(filter);
   })

   $("#clear-completed").click(function() {
      todo.remove("completed");
   })

   // listen to model
   todo.on("add", add).on("remove", function(items) {
      $.each(items, function() {
         els[this.id].remove()
      })

   }).on("toggle", function(items) {
      $.each(items, function() {
         toggle(els[this.id], !!this.done)
      })

   }).on("edit", function(item) {
      var el = els[item.id];
      el.removeClass("editing");
      $("label, .edit", el).text(item.name).val(item.name);

   // counts
   }).on("add remove toggle", counts)

   // routing
   var nav = $("#filters a").click(function() {
      $.route($(this).attr("href").slice(1));
   })

   $.route(function(path) {
      filter = path.slice(1);

      root.empty();

      $.each(todo.items(filter), function(i, item) {
         add(item);
      })

      // nav
      nav.removeClass("selected").filter("[href='#" + path + "']").addClass("selected");

      counts()
   })

   // private functions
   function toggle(el, flag) {
      el.toggleClass("completed", flag);
      $(":checkbox", el).prop("checked", flag);
   }

   function add(item) {
      var el = $.el(template, item).appendTo(root),
         input = $(".edit", el);

      $(".toggle", el).click(function() {
         todo.toggle(item.id);
      })

      toggle(el, !!item.done);

      // edit
      input.keydown(function(e) {
         var val = $.trim(this.value);
         if (e.which == 13 && val) {
            item.name = val;
            todo.edit(item);
         }
      })

      $("label", el).dblclick(function() {
         el.addClass("editing");
         input.focus()[0].select();
      })

      // remove
      $(".destroy", el).click(function() {
         todo.remove(item.id);
      })

      els[item.id] = el;
   }

   function counts() {
      var active = todo.items("active").length,
         comp = todo.items("completed").length;

      $("#todo-count").html("<strong>" + active + "</strong> " + (active == 1 ? "item" : "items") + " left")
      $("#clear-completed").toggle(comp > 0).text("Clear completed (" + comp + ")")
      $("#footer").toggle(active + comp > 0)
   }

})()
