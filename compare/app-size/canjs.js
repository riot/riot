/*global $ Todos Models Mustache can*/
(function () {
	'use strict';
	$(function () {
		// Set up a route that maps to the `filter` attribute
		can.route(':filter');
		// Delay routing until we initialized everything
		can.route.ready(false);

		// View helper for pluralizing strings
		Mustache.registerHelper('plural', function (str, count) {
			return str + (count !== 1 ? 's' : '');
		});

		// Initialize the app
		Models.Todo.findAll({}, function (todos) {
			new Todos('#todoapp', {
				todos: todos,
				state: can.route,
				view : 'views/todos.mustache'
			});
		});

		// Now we can start routing
		can.route.ready(true);
	});
})();
(function(i,m,l){i.view.ext=".mustache";var n=function(a){return i.isFunction(a.attr)&&a.constructor&&!!a.constructor.canMakeObserve},o=function(a){return a&&a.splice&&"number"==typeof a.length},h=function(a){if(this.constructor!=h){var c=new h(a);return function(a){return c.render(a)}}"function"==typeof a?this.template={fn:a}:(i.extend(this,a),this.template=this.scanner.scan(this.text,this.name))};i.Mustache=m.Mustache=h;h.prototype.render=function(a){a=a||{};return this.template.fn.call(a,a,{_data:a})};
i.extend(h.prototype,{scanner:new i.view.Scanner({text:{start:"var ___c0nt3xt = []; ___c0nt3xt.___st4ck = true;var ___st4ck = function(context, self) {var s;if (arguments.length == 1 && context) {s = !context.___st4ck ? [context] : context;} else {s = context && context.___st4ck ? context.concat([self]) : ___st4ck(context).concat([self]);}return (s.___st4ck = true) && s;};"},tokens:[["returnLeft","{{{","{{[{&]"],["commentFull","{{!}}","^[\\s\\t]*{{!.+?}}\\n"],["commentLeft","{{!","(\\n[\\s\\t]*{{!|{{!)"],
["escapeFull","{{}}","(^[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}$)",function(a){return{before:/^\n.+?\n$/.test(a)?"\n":"",content:a.match(/\{\{(.+?)\}\}/)[1]||""}}],["escapeLeft","{{"],["returnRight","}}}"],["right","}}"]],helpers:[{name:/^>[\s|\w]\w*/,fn:function(a){return"can.view.render('"+i.trim(a.replace(/^>\s?/,""))+"', ___st4ck(___c0nt3xt,this).pop())"}},{name:/^\s?data\s/,fn:function(a){return"can.proxy(function(__){can.data(can.$(__),'"+a.replace(/(^\s?data\s)|(["'])/g,
"")+"', this.pop()); }, ___st4ck(___c0nt3xt,this))"}},{name:/^.*$/,fn:function(a,c){var b=!1,d=[],a=i.trim(a);if(a.length&&(b=a.match(/^([#^/]|else$)/))){b=b[0];switch(b){case "#":case "^":d.push(c.insert+"can.view.txt(0,'"+c.tagName+"',"+c.status+",this,function(){ return ");break;case "/":return{raw:'return ___v1ew.join("");}}])}));'}}a=a.substring(1)}if("else"!=b){var j=[],f=0,g=!1,h,e;(i.trim(a)+" ").replace(/((([^\s]+?=)?('.*?'|".*?"))|.*?)\s/g,function(a,b){j.push(b)});for(d.push("can.Mustache.txt(___st4ck(___c0nt3xt,this),"+
(b?'"'+b+'"':"null")+",");h=j[f];f++)f&&d.push(","),f&&(e=h.match(/^(('.*?'|".*?"|[0-9.]+|true|false)|((.+?)=(('.*?'|".*?"|[0-9.]+|true|false)|(.+))))$/))?e[2]?d.push(e[0]):(g||(g=!0,d.push("{___h4sh:{")),d.push(e[4],":",e[6]?e[6]:'can.Mustache.get("'+e[5].replace(/"/g,'\\"')+'",___st4ck(___c0nt3xt,this))'),f==j.length-1&&d.push("}}")):d.push('can.Mustache.get("'+h.replace(/"/g,'\\"')+'",___st4ck(___c0nt3xt,this)'+(0==f&&1<j.length?",true":"")+")")}b&&"else"!=b&&d.push(",[{_:function(){");switch(b){case "#":d.push('return ___v1ew.join("");}},{fn:function(___c0nt3xt){var ___v1ew = [];');
break;case "else":case "^":d.push('return ___v1ew.join("");}},{inverse:function(___c0nt3xt){var ___v1ew = [];');break;default:d.push(");")}d=d.join("");return b?{raw:d}:d}}]})});for(var m=i.view.Scanner.prototype.helpers,p=0;p<m.length;p++)h.prototype.scanner.helpers.unshift(m[p]);h.registerHelper=function(a,c){this._helpers.push({name:a,fn:c})};h.getHelper=function(a){for(var c=0,b;b=this._helpers[c];c++)if(b.name==a)return b;return null};h.txt=function(a,c,b){var d=Array.prototype.slice.call(arguments,
3),j=i.extend.apply(i,[{fn:function(){},inverse:function(){}}].concat(c?d.pop():[])),f=d.length?d:[b],g=!0,k=[],e;if(c)for(e=0;e<f.length;e++)g=o(f[e])?"#"==c?g&&!!f[e].length:"^"==c?g&&!f[e].length:g:"#"==c?g&&!!f[e]:"^"==c?g&&!f[e]:g;if(f=h.getHelper(b)||i.isFunction(b)&&{fn:b}){a=a.___st4ck&&a[a.length-1]||a;j={fn:i.proxy(j.fn,a),inverse:i.proxy(j.inverse,a)};if((g=d[d.length-1])&&g.___h4sh)j.hash=d.pop().___h4sh;d.push(j);return f.fn.apply(a,d)||""}if(g)switch(c){case "#":if(o(b)){for(e=0;e<b.length;e++)k.push(j.fn.call(b[e]||
{},a)||"");return k.join("")}return j.fn.call(b||{},a)||"";case "^":return j.inverse.call(b||{},a)||"";default:return""+(b!==l?b:"")}return""};h.get=function(a,c,b){var d=a.split("."),j=c[c.length-1],f=c[c.length-2],g,k,e;if(/^\.|this$/.test(a)){if(/^object|undefined$/.test(typeof f)){for(;b=c.pop();)if("undefined"!==typeof b)return b;return""}return f||""}if(!b)for(f=c.length-1;0<=f;f--){b=c[f];if(b!==l)for(e=0;e<d.length;e++)if("undefined"!=typeof b[d[e]])g=b,b=b[k=d[e]];else{n(b)?(g=b,k=d[e]):
g=b=l;break}if(b!==l){if(i.isFunction(g[k]))return g[k]();if(n(g))return g.attr(k);n(b)&&o(b)&&b.attr("length");return b}}return j!==l&&i.isFunction(j[a])?j[a]:h.getHelper(a)?a:""};h._helpers=[{name:"if",fn:function(a,c){return a?c.fn(this):c.inverse(this)}},{name:"unless",fn:function(a,c){if(!a)return c.fn(this)}},{name:"each",fn:function(a,c){if(a&&a.length){for(var b=[],d=0;d<a.length;d++)b.push(c.fn(a[d]));return b.join("")}}},{name:"with",fn:function(a,c){if(a)return c.fn(a)}}];i.view.register({suffix:"mustache",
contentType:"x-mustache-template",script:function(a,c){return"can.Mustache(function(_CONTEXT,_VIEW) { "+(new h({text:c,name:a})).template.out+" })"},renderer:function(a,c){return h({text:c,name:a})}})})(can,this);
/*global can */
(function (namespace, undefined) {
	'use strict';

	// Basic Todo entry model
	// { text: 'todo', complete: false }
	var Todo = can.Model.LocalStorage({
		storageName: 'todos-canjs'
	}, {
		// Returns if this instance matches a given filter
		// (currently `active` and `complete`)
		matches : function () {
			var filter = can.route.attr('filter');
			return !filter || (filter === 'active' && !this.attr('complete')) ||
				(filter === 'completed' && this.attr('complete'));
		}
	});

	// List for Todos
	Todo.List = can.Model.List({
		completed: function () {
			var completed = 0;

			this.each(function (todo) {
				completed += todo.attr('complete') ? 1 : 0;
			});

			return completed;
		},

		remaining: function () {
			return this.attr('length') - this.completed();
		},

		allComplete: function () {
			return this.attr('length') === this.completed();
		}
	});

	namespace.Models = namespace.Models || {};
	namespace.Models.Todo = Todo;
})(this);
/*global can Models*/
(function (namespace, undefined) {
	'use strict';

	var ENTER_KEY = 13;
	var Todos = can.Control({
		// Default options
		defaults : {
			view : 'views/todos.ejs'
		}
	}, {
		// Initialize the Todos list
		init: function () {
			// Render the Todos
			this.element.append(can.view(this.options.view, this.options));
		},

		// Listen for when a new Todo has been entered
		'#new-todo keyup': function (el, e) {
			var value = can.trim(el.val());
			if (e.keyCode === ENTER_KEY && value !== '') {
				new Models.Todo({
					text : value,
					complete : false
				}).save(function () {
					el.val('');
				});
			}
		},

		// Handle a newly created Todo
		'{Models.Todo} created': function (list, e, item) {
			this.options.todos.push(item);
			// Reset the filter so that you always see your new todo
			this.options.state.attr('filter', '');
		},

		// Listener for when the route changes
		'{state} change' : function () {
			// Remove the `selected` class from the old link and add it to the link for the current location hash
			this.element.find('#filters').find('a').removeClass('selected')
				.end().find('[href="' + window.location.hash + '"]').addClass('selected');
		},

		// Listen for editing a Todo
		'.todo dblclick': function (el) {
			el.data('todo').attr('editing', true).save(function () {
				el.children('.edit').focus();
			});
		},

		// Update a todo
		updateTodo: function (el) {
			var value = can.trim(el.val()),
				todo = el.closest('.todo').data('todo');

			// If we don't have a todo we don't need to do anything
			if (!todo) {
				return;
			}

			if (value === '') {
				todo.destroy();
			} else {
				todo.attr({
					editing : false,
					text : value
				}).save();
			}
		},

		// Listen for an edited Todo
		'.todo .edit keyup': function (el, e) {
			if (e.keyCode === ENTER_KEY) {
				this.updateTodo(el);
			}
		},

		'.todo .edit focusout' : 'updateTodo',

		// Listen for the toggled completion of a Todo
		'.todo .toggle click': function (el) {
			el.closest('.todo').data('todo')
				.attr('complete', el.is(':checked'))
				.save();
		},

		// Listen for a removed Todo
		'.todo .destroy click': function (el) {
			el.closest('.todo').data('todo').destroy();
		},

		// Listen for toggle all completed Todos
		'#toggle-all click': function (el) {
			var toggle = el.prop('checked');
			can.each(this.options.todos, function (todo) {
				todo.attr('complete', toggle).save();
			});
		},

		// Listen for removing all completed Todos
		'#clear-completed click': function () {
			for (var i = this.options.todos.length - 1, todo; i > -1 && (todo = this.options.todos[i]); i--) {
				if (todo.attr('complete')) {
					todo.destroy();
				}
			}
		}
	});

	namespace.Todos = Todos;
})(this);
