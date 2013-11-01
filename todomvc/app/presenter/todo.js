/*global $, Todo */

(function () {
	'use strict';

	/*
		A Model instance. Exposed to global space so it can be used
		on the browser's console. Try for example:

		todo.add('My task');
	*/
	var todo = window.todo = new Todo();

	// HTML for a single todo item
	var template = $('[type="html/todo"]').html();
	var root = $('#todo-list');
	var nav = $('#filters a');

	var ENTER_KEY = 13;

	/* Listen to user events */

	$('#new-todo').on('keyup', function (e) {
		var val = $.trim(this.value);

		if (val && e.which === ENTER_KEY) {
			todo.add(val);
			this.value = '';
		}
	});

	$('#toggle-all').on('click', function () {
		$('li', root).each(function () {
			todo.toggle(this.id);
		});
	});

	$('#clear-completed').on('click', function () {
		todo.remove('completed');
	});

	/* Listen to model events */
	todo.on('add', add);

	todo.on('remove', function (items) {
		$.each(items, function () {
			$('#' + this.id).remove();
		});
	});

	todo.on('toggle', function (item) {
		toggle($('#' + item.id), !!item.done);
	});

	todo.on('edit', function (item) {
		var el = $(item.id);

		el.removeClass('editing');

		$('label, .edit', el).text(item.name).val(item.name);
	});

	todo.on('add remove toggle', counts);

	// routing
	nav.on('click', function () {
		var href = $(this).attr('href');

		return $.route(href);
	});

	$.route(function (hash) {
		// clear list
		root.empty();

		// add new todos
		$.each(todo.items(hash.slice(2)), add);

		// selected class
		nav.removeClass('selected').filter('[href="' + hash + '"]').addClass('selected');

		// update counts
		counts();
	});

	// private functions
	function toggle(el, flag) {
		el.toggleClass('completed', flag);
		$(':checkbox', el).prop('checked', flag);
	}

	function add(item) {
		if (this.id) {
			item = this;
		}

		var el = $.el(template, item).appendTo(root);
		var input = $('.edit', el);

		$('.toggle', el).on('click', function () {
			todo.toggle(item.id);
		});

		toggle(el, !!item.done);

		// edit
		input.on('keydown', function (e) {
			var val = $.trim(this.value);

			if (val && e.which === ENTER_KEY) {
				item.name = val;
				todo.edit(item);
			}
		});

		$('label', el).on('dblclick', function () {
			el.addClass('editing');
			input.focus()[0].select();
		});

		// remove
		$('.destroy', el).on('click', function () {
			todo.remove(item.id);
		});
	}

	function counts() {
		var active = todo.items('active').length;
		var done = todo.items('completed').length;

		$('#todo-count').html('<strong>' +active+ '</strong> item' +(active === 1 ? '' : 's')+ ' left');
		$('#clear-completed').toggle(done > 0).text('Clear completed (' + done + ')');
		$('#footer').toggle(active + done > 0);
	}
})();
