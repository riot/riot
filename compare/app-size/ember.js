/*global Ember, DS, Todos:true */
window.Todos = Ember.Application.create();

Todos.ApplicationAdapter = DS.LSAdapter.extend({
	namespace: 'todos-emberjs'
});
/*global Todos, Ember */
'use strict';

Todos.TodoController = Ember.ObjectController.extend({
	isEditing: false,

	// We use the bufferedTitle to store the original value of
	// the model's title so that we can roll it back later in the
	// `cancelEditing` action.
	bufferedTitle: Ember.computed.oneWay('title'),

	actions: {
		editTodo: function () {
			this.set('isEditing', true);
		},

		doneEditing: function () {
			var bufferedTitle = this.get('bufferedTitle');

			if (Ember.isEmpty(bufferedTitle.trim())) {
				// The `doneEditing` action gets sent twice when the user hits
				// enter (once via 'insert-newline' and once via 'focus-out').
				//
				// We debounce our call to 'removeTodo' so that it only gets
				// sent once.
				Ember.run.debounce(this, this.send, 'removeTodo', 0);
			} else {
				var todo = this.get('model');
				todo.set('title', this.get('bufferedTitle'));
				todo.save();
			}

			this.set('isEditing', false);
		},

		cancelEditing: function () {
			this.set('bufferedTitle', this.get('title'));
			this.set('isEditing', false);
		},

		removeTodo: function () {
			var todo = this.get('model');

			todo.deleteRecord();
			todo.save();
		}
	}
});
/*global Todos, Ember */
'use strict';

Todos.TodosController = Ember.ArrayController.extend({
	actions: {

		createTodo: function () {
			var title, todo;

			// Get the todo title set by the "New Todo" text field
			title = this.get('newTitle');
			if (!title.trim()) {
				return;
			}

			// Create the new Todo model
			todo = this.store.createRecord('todo', {
				title: title,
				isCompleted: false
			});
			todo.save();

			// Clear the "New Todo" text field
			this.set('newTitle', '');
		},

		clearCompleted: function () {
			var completed = this.filterProperty('isCompleted', true);
			completed.invoke('deleteRecord');
			completed.invoke('save');
		},
	},

	remaining: function () {
		return this.filterProperty('isCompleted', false).get('length');
	}.property('@each.isCompleted'),

	remainingFormatted: function () {
		var remaining = this.get('remaining');
		var plural = remaining === 1 ? 'item' : 'items';
		return '<strong>%@</strong> %@ left'.fmt(remaining, plural);
	}.property('remaining'),

	completed: function () {
		return this.filterProperty('isCompleted', true).get('length');
	}.property('@each.isCompleted'),

	hasCompleted: function () {
		return this.get('completed') > 0;
	}.property('completed'),

	allAreDone: function (key, value) {
		if (value !== undefined) {
			this.setEach('isCompleted', value);
			return value;
		} else {
			return !!this.get('length') &&
				this.everyProperty('isCompleted', true);
		}
	}.property('@each.isCompleted')
});
/*global Todos, DS */
'use strict';

Todos.Todo = DS.Model.extend({
	title: DS.attr('string'),
	isCompleted: DS.attr('boolean'),

	saveWhenCompletedChanged: function () {
		this.save();
	}.observes('isCompleted')
});
/*global Ember, Todos */
'use strict';

Todos.Router.map(function () {
	this.resource('todos', { path: '/' }, function () {
		this.route('active');
		this.route('completed');
	});
});

Todos.TodosRoute = Ember.Route.extend({
	model: function () {
		return this.store.find('todo');
	}
});

Todos.TodosIndexRoute = Ember.Route.extend({
	setupController: function () {
		this.controllerFor('todos').set('filteredTodos', this.modelFor('todos'));
	}
});

Todos.TodosActiveRoute = Ember.Route.extend({
	setupController: function () {
		var todos = this.store.filter('todo', function (todo) {
			return !todo.get('isCompleted');
		});

		this.controllerFor('todos').set('filteredTodos', todos);
	}
});

Todos.TodosCompletedRoute = Ember.Route.extend({
	setupController: function () {
		var todos = this.store.filter('todo', function (todo) {
			return todo.get('isCompleted');
		});

		this.controllerFor('todos').set('filteredTodos', todos);
	}
});
/*global Todos, Ember */
'use strict';

Todos.EditTodoView = Ember.TextField.extend({
	focusOnInsert: function () {
		this.$().focus();
	}.on('didInsertElement')
});

Ember.Handlebars.helper('edit-todo', Todos.EditTodoView);
