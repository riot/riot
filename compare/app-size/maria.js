/*jshint strict: false */
/*global maria, Router, checkit */

maria.on(window, 'load', function () {
	var model;

	if ((typeof localStorage === 'object') && (typeof JSON === 'object')) {
		var store = localStorage.getItem('todos-maria');

		if (store) {
			model = checkit.TodosModel.fromJSON(JSON.parse(store));
		} else {
			model = new checkit.TodosModel();
		}

		maria.on(model, 'change', function () {
			localStorage.setItem('todos-maria', JSON.stringify(model.toJSON()));
		});
	} else {
		model = new checkit.TodosModel();
	}

	var routes = {
		'/': function () {
			model.setMode('all');
		},
		'/active': function () {
			model.setMode('incompleted');
		},
		'/completed': function () {
			model.setMode('completed');
		}
	};

	var router = new Router(routes);
	router.init();

	var view = new checkit.TodosAppView(model);
	document.body.insertBefore(view.build(), document.body.firstChild);
});
/*jshint strict: false */
/*global maria, checkit */

maria.Controller.subclass(checkit, 'TodoController', {
	properties: {
		onClickDestroy: function () {
			this.getModel().destroy();
		},

		onClickToggle: function () {
			this.getModel().toggleCompleted();
		},

		onDblclickLabel: function () {
			this.getView().showEdit();
		},

		onKeyupEdit: function (evt) {
			var keyCode = evt.keyCode;

			if (checkit.isEnterKeyCode(keyCode)) {
				this.onBlurEdit();
			} else if (checkit.isEscapeKeyCode(keyCode)) {
				var view = this.getView();

				view.resetEdit();
				view.showDisplay();
			}
		},

		onBlurEdit: function () {
			var model = this.getModel();
			var view = this.getView();
			var value = view.getInputValue();

			view.showDisplay();

			if (checkit.isBlank(value)) {
				model.destroy();
			} else {
				model.setTitle(value);
			}
		}
	}
});
/*jshint strict: false */
/*global maria, checkit */

maria.Controller.subclass(checkit, 'TodosAppController', {
	properties: {
		onKeyupNewTodo: function (evt) {
			if (checkit.isEnterKeyCode(evt.keyCode)) {
				var view = this.getView();
				var value = view.getInputValue();

				if (!checkit.isBlank(value)) {
					var todo = new checkit.TodoModel();

					todo.setTitle(value);
					this.getModel().add(todo);

					view.clearInput();
				}
			}
		},

		onClickToggleAll: function () {
			var model = this.getModel();

			if (model.isAllCompleted()) {
				model.markAllIncompleted();
			} else {
				model.markAllCompleted();
			}
		},

		onClickClearCompleted: function () {
			this.getModel().deleteCompleted();
		}
	}
});
/*jshint strict: false */
/*global maria, checkit */

maria.Model.subclass(checkit, 'TodoModel', {
	properties: {
		_title: '',
		_completed: false,

		getTitle: function () {
			return this._title;
		},

		setTitle: function (title) {
			title = ('' + title).trim();

			if (this._title !== title) {
				this._title = title;

				this.dispatchEvent({ type: 'change' });
			}
		},

		isCompleted: function () {
			return this._completed;
		},

		setCompleted: function (completed) {
			completed = !!completed;

			if (this._completed !== completed) {
				this._completed = completed;

				this.dispatchEvent({ type: 'change' });
			}
		},

		toggleCompleted: function () {
			this.setCompleted(!this.isCompleted());
		},

		toJSON: function () {
			return {
				title: this._title,
				completed: this._completed
			};
		}
	}
});

checkit.TodoModel.fromJSON = function (todoJSON) {
	var model = new checkit.TodoModel();

	model._title = todoJSON.title;
	model._completed = todoJSON.completed;

	return model;
};
/*jshint strict: false */
/*global maria, checkit */

maria.SetModel.subclass(checkit, 'TodosModel', {
	properties: {
		_mode: 'all',

		getPossibleModes: function () {
			return ['all', 'incompleted', 'completed'];
		},

		getMode: function () {
			return this._mode;
		},

		setMode: function (mode) {
			var modePossible = this.getPossibleModes().some(function (m) {
				return m === mode;
			});

			if (modePossible) {
				if (this._mode !== mode) {
					this._mode = mode;

					this.dispatchEvent({ type: 'change' });
				}
			} else {
				throw new Error('checkit.TodosModel.prototype.setMode: unsupported mode "' + mode + '".');
			}
		},

		getCompleted: function () {
			var completeTodos = [];
			this.forEach(function (todo) {
				if (todo.isCompleted()) {
					completeTodos.push(todo);
				}
			});
			return completeTodos;
		},

		getIncompleted: function () {
			var incompleteTodos = [];
			this.forEach(function (todo) {
				if (!todo.isCompleted()) {
					incompleteTodos.push(todo);
				}
			});
			return incompleteTodos;
		},

		isAllCompleted: function () {
			return (this.size > 0) && (this.getCompleted().length === this.size);
		},

		isEmpty: function () {
			return this.size === 0;
		},

		markAllCompleted: function () {
			this.forEach(function (todo) {
				todo.setCompleted(true);
			});
		},

		markAllIncompleted: function () {
			this.forEach(function (todo) {
				todo.setCompleted(false);
			});
		},

		deleteCompleted: function () {
			this['delete'].apply(this, this.getCompleted());
		},

		toJSON: function () {
			var todoJSON = [];
			this.forEach(function (todo) {
				todoJSON.push(todo.toJSON());
			});
			return todoJSON;
		}
	}
});

checkit.TodosModel.fromJSON = function (todosJSON) {
	var model = new checkit.TodosModel();
	var i;
	var ilen;

	for (i = 0, ilen = todosJSON.length; i < ilen; i++) {
		model.add(checkit.TodoModel.fromJSON(todosJSON[i]));
	}

	return model;
};
/*jshint unused:false */

var checkit = {};
/*global checkit */

// In a full development environment this template would be expressed
// in a file containing only HTML and be compiled to the following as part
// of the server/build functionality.
//
// Due to the limitations of a simple example that does not require
// any special server environment to try, the manually compiled version is
// included here.
//
checkit.TodoTemplate =
	'<li>' +
		'<div class="view">' +
			'<input class="toggle" type="checkbox">' +
			'<label></label>' +
			'<button class="destroy"></span>' +
		'</div>' +
		'<input class="edit">' +
	'</li>';
/*global checkit */

// In a full development environment this template would be expressed
// in a file containing only HTML and be compiled to the following as part
// of the server/build functionality.
//
// Due to the limitations of a simple example that does not require
// any special server environment to try, the manually compiled version is
// included here.
//
checkit.TodosAppTemplate =
	'<section id="todoapp">' +
		'<header id="header">' +
			'<h1>todos</h1>' +
			'<input id="new-todo" placeholder="What needs to be done?" autofocus>' +
		'</header>' +
		'<section id="main">' +
			'<input id="toggle-all" type="checkbox">' +
			'<label for="toggle-all">Mark all as completed</label>' +
			'<ul id="todo-list"></ul>' +
		'</section>' +
		'<footer id="footer">' +
			'<span id="todo-count"></span>' +
			'<ul id="filters">' +
				'<li>' +
					'<a class="all-filter" href="#/">All</a>' +
				'</li>' +
				'<li>' +
					'<a class="incompleted-filter" href="#/active">Active</a>' +
				'</li>' +
				'<li>' +
					'<a class="completed-filter" href="#/completed">Completed</a>' +
				'</li>' +
			'</ul>' +
			'<button id="clear-completed"></button>' +
		'</footer>' +
	'</section>';
/*jshint strict: false */
/*global checkit */

checkit.isBlank = function (str) {
	return (/^\s*$/).test(str);
};

checkit.escapeHTML = function (str) {
	return String(str)
		.replace(/&(?!\w+;)/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
};

checkit.isEnterKeyCode = function (keyCode) {
	return keyCode === 13;
};

checkit.isEscapeKeyCode = function (keyCode) {
	return keyCode === 27;
};
/*jshint strict: false */
/*global maria, aristocrat, checkit */

maria.ElementView.subclass(checkit, 'TodoView', {
	uiActions: {
		'click .destroy': 'onClickDestroy',
		'click .toggle': 'onClickToggle',
		'dblclick label': 'onDblclickLabel',
		'keyup .edit': 'onKeyupEdit',
		'blur .edit': 'onBlurEdit'
	},

	properties: {
		buildData: function () {
			var model = this.getModel();
			var item = this.find('li');

			aristocrat.removeClass(item, '(in|)completed');
			aristocrat.addClass(item, (model.isCompleted() ? 'completed' : 'incompleted'));

			this.find('label').innerHTML = checkit.escapeHTML(model.getTitle());

			this.find('.toggle').checked = model.isCompleted();
		},

		update: function () {
			this.buildData();
		},

		resetEdit: function () {
			var input = this.find('.edit');

			input.value = this.getModel().getTitle();
		},

		showEdit: function () {
			var input = this.find('.edit');

			this.resetEdit();

			aristocrat.addClass(this.find('li'), 'editing');

			input.focus();
		},

		showDisplay: function () {
			aristocrat.removeClass(this.find('li'), 'editing');
		},

		getInputValue: function () {
			return this.find('.edit').value;
		}
	}
});
/*jshint strict: false */
/*global maria, aristocrat, checkit */

maria.SetView.subclass(checkit, 'TodosAppView', {
	uiActions: {
		'keyup #new-todo': 'onKeyupNewTodo',
		'click #toggle-all': 'onClickToggleAll',
		'click #clear-completed': 'onClickClearCompleted'
	},

	properties: {
		buildData: function () {
			var model = this.getModel();

			var length = model.size;
			this.find('#main').style.display = (length > 0) ? '' : 'none';
			this.find('#footer').style.display = (length > 0) ? '' : 'none';

			var checkbox = this.find('#toggle-all');
			checkbox.checked = model.isAllCompleted();
			checkbox.disabled = model.isEmpty();

			var todoList = this.find('#todo-list');
			model.getPossibleModes().forEach(function (mode) {
				aristocrat.removeClass(todoList, mode);
			});
			aristocrat.addClass(todoList, model.getMode());

			var incompletedLength = model.getIncompleted().length;
			this.find('#todo-count').innerHTML =
				'<strong>' + incompletedLength + '</strong> ' +
				((incompletedLength === 1) ? 'item' : 'items') +
				' left';

			var selected = this.find('.selected');
			if (selected) {
				aristocrat.removeClass(selected, 'selected');
			}
			aristocrat.addClass(this.find('.' + model.getMode() + '-filter'), 'selected');

			var completedLength = model.getCompleted().length;
			var clearButton = this.find('#clear-completed');
			clearButton.style.display = (completedLength > 0) ? '' : 'none';
			clearButton.innerHTML = 'Clear completed (' + completedLength + ')';
		},

		update: function (evt) {
			maria.SetView.prototype.update.call(this, evt);

			this.buildData();
		},

		getContainerEl: function () {
			// child views will be appended to this element
			return this.find('#todo-list');
		},

		createChildView: function (todoModel) {
			return new checkit.TodoView(todoModel);
		},

		getInputValue: function () {
			return this.find('#new-todo').value;
		},

		clearInput: function () {
			this.find('#new-todo').value = '';
		}
	}
});
