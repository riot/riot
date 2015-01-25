
title: Riot developer guide
subtitle: Guide
description: Developing client-side applications with Riot

====

# Custom tag example

Riot custom tags are the building blocks for user interfaces. They make the "view" part of the application. Here is an extended TODO example showing various features of Riot:


```
<todo>

  <h3>{ opts.title }</h3>

  <ul>
    <li each={ items }>
      <label class={ completed: done }>
        <input type="checkbox" checked={ done } onclick={ parent.toggle }> { title }
      </label>
    </li>
  </ul>

  <form onsubmit={ add }>
    <input name="input" onkeyup={ edit }>
    <button disabled={ !text }>Add #{ items.length + 1 }</button>
  </form>

  this.disabled = true

  this.items = opts.items

  edit(e) {
    this.text = e.target.value
  }

  add(e) {
    if (this.text) {
      this.items.push({ title: this.text })
      this.text = this.input.value = ''
    }
  }

  toggle(e) {
    var item = e.item
    item.done = !item.done
    return true
  }

</todo>
```

See [live demo](/riotjs/dist/demo/) or download [demo.zip](/riotjs/dist/riot-{{ riot_version }}.zip)



### Tag syntax

In a Riot custom tag the HTML layout is defined first, JavaSript second. HTML is coupled with expressions that are 100% JavaScript.

Characteristics:

* Tags can be HTML only. JavaScript logic and `{ expressions }` are optional.
* Expressions are placed inside tags or as attribute values.
* Quotes around attribute expressions are optional. You can write `<foo bar={ baz }>` instead of `<foo bar="{ baz }">`.
* Methods can be defined with compact ES6 syntax. `methodName()` becomes `this.methodName = function()` and `this` variable always points to the current tag instance.
* A shorthand syntax for class names is available: `class={ completed: done }`.
* Boolean attributes (checked, selected etc..) are ignored when the expression value is falsy: `<input checked={ undefined }>` becomes `<input>`.
* Self-closing tags are supported: `<div/>` equals `<div></div>`. Well known "open tags" such as `<br>`, `<hr>`, `<img>` or `<input>` need not to be closed.
* Nested `<style>` tags are supported, but nested expressions are not evaluated
* Standard HTML tags (`label`, `table`, `a` etc..) can also be customized, but not necessarily a wise thing to do.

Tag definition always starts on the beginning of the line:

```
<!-- works -->
<my-tag>

</my-tag>

  <!-- this fails, because of indentation -->
  <my-tag>

  </my-tag>
```


## Mounting

Once a tag is created you can mount it on the page as follows:


``` html
<body>

  <!-- place the custom tag anywhere inside the body -->
  <todo></todo>

  <!-- include riot.js -->
  &lt;script src="riot.min.js"></script>

  <!-- include the tag -->
  &lt;script src="todo.js"></script>

  <!-- mount the tag -->
  &lt;script>riot.mount('todo')</script>

</body>
```

Some example uses of the mount method:

``` js
// mount all custom tags on the page
riot.mount('*')

// mount an element with a specific id
riot.mount('#my-element')

// mount selected elements
riot.mount('todo, forum, comments')
```

Document can contain multiple instances of the same tag.


### Options

You can pass options for tags in the second argument

```
&lt;script>
riot.mount('todo', { title: 'My TODO app', items: [ ... ] })
</script>
```

The passed data can be anything, ranging from a simple object to a full application API. Or it can be a Flux store. Depends on the designed architecture.

Inside the tag the options can be referenced with the `opts` variable as follows:

```
<my-tag>

  <!-- Options in HTML -->
  <h3>{ opts.title }</h3>

  // Options in JavaScript
  var title = opts.title

</my-tag>
```

### Tag lifecycle

Tag is created in following sequence:

1. Tag's JavaScript logic is executed
2. HTML expressions are calculated and "update" event is fired
3. Tag is mounted on the page and "mount" event is fired

After the tag is mounted the expressions are updated as follows:

1. Automatically after an event handler is called. For example the `toggle` method in the above example.
2. When `this.update()` is called inside the tag instance.
3. When `riot.update()` is called, which globally updates all expressions on the page.

The "update" event is fired every time the tag is updated.

Since the values are calculated before mounting there are no surprise issues such as failed `<img src={ src }>` calls.


### Listening to lifecycle events

You can listen to various lifecyle events inside the tag as follows:


``` js
<todo>

  this.on('mount', function() {
    // right after tag is mounted on the page
  })

  this.on('update', function() {
    // allows recalculation of context data before the update
  })

  this.on('unmount', function() {
    // when the tag is removed from the page
  })

  // curious about all events ?
  this.on('mount update unmount', function(eventName) {
    console.info(eventName)
  })

</todo>
```

You can have multiple event listeners for the same event. See [observable](/riotjs/api/#observable) for more details about events.


## Expressions

HTML can be mixed with expressions that are enclosed in brackets:

``` js
{ /* my_expression goes here */ }
```

Expressions can set attributes or nested text nodes:

``` html
<h3 id={ /* attribute_expression */ }>
  { /* nested_expression */ }
</h3>
```

Expressions are 100% JavaScript. A few examples:

``` js
{ title || 'Untitled' }
{ results ? 'ready' : 'loading' }
{ new Date() }
{ message.length > 140 && 'Message is too long' }
{ Math.round(rating) }
```

The goal is to keep the expressions small so your HTML stays as clean as possible. If your expression grows in complexity consider moving some of logic to the "update" event. For example:


```
<my-tag>

  <!-- the `val` is calculated below .. -->
  <p>{ val }</p>

  // ..on every update
  this.on('update', function() {
    this.val = some / complex * expression ^ here
  })
</my-tag>
```


### Boolean attributes

Boolean attributes (checked, selected etc..) are ignored when the expression value is falsy:

`<input checked={ null }>` becomes `<input>`.

W3C states that a boolean property is true if the attribute is present at all — even if the value is empty of `false`.

The following expression does not work:

``` html
<input type="checkbox" { true ? 'checked' : ''}>
```

since only attribute and nested text expressions are valid. Riot detects 44 different boolean attributes.


### Class shorthand

Riot has a special syntax for CSS class names. For example:

``` js
<p class={ foo: true, bar: 0, baz: new Date(), zorro: 'a value' }></p>
```

evaluates to "foo baz zorro". Property names whose value is truthful are appended to the list of class names. Of course you can use this notation in other places than class names if you find a suitable use case.

### Miscellaneous

You can output an expression without evaluation by escaping the opening bracket:

`\\{ this is not evaluated \\}` outputs `{ this is not evaluated }`

Expressions inside `<style>` tags are ignored.


## Nested tags

Let's define a parent tag `<account>` and with a nested tag `<subscription>`:


```
<account>
  <subscription  plan={ opts.plan } show_details="true" />
</account>


<subscription>
  <h3>{ opts.plan.name }</h3>

  // Get JS handle to options
  var plan = opts.plan,
      show_details = opts.show_details

  // access to the parent tag
  var parent = this.parent

</subscription>
```

Then we mount the `account` tag to the page with a `plan` configuration option:

```
<body>
  <account></account>
</body>

&lt;script>
riot.mount('account', { plan: { name: 'small', term: 'monthly' } })
</script>
```

Parent tag options are passed with the `riot.mount` method and child tag options are passed on the tag attribute.


## Named elements

Elements with `name` or `id` attribute are automatically bound to the context so you'll have an easy access to them with JavaScript:

```
<login>
  <form id="login" onsubmit={ submit }>
    <input name="username">
    <input name="password">
    <button name="submit">
  </form>

  // grab above HTML elements
  var form = this.login,
    username = this.username.value,
    password = this.password.value,
    button = this.submit

</login>
```

Of course these named elements can be referred in HTML as well. `<div>{ username.value }</div>`


## Event handlers

A function that deals with DOM events is called an "event handler". Event handlers are defined as follows:

```
<login>
  <form onsubmit={ submit }>

  </form>

  // this method is called when above form is submitted
  submit(e) {

  }
</login>
```

Attributes beginning with "on" (`onclick`, `onsubmit`, `oninput` etc...) accept a function value which is called when the event occurs. This function can also be defined dynamically with an expression. For example:


``` html
<form onsubmit={ condition ? method_a : method_b }>
```

In the function `this` refers to the current tag instance. After the handler is called `this.update()` is automatically called reflecting all the possible changes to the UI.

The default event handler behavior is *automatically cancelled*. This means that `e.preventDefault()` is already called for you, because this is what you usually want (or forget to do). You can let the browser do the default thing by returning `true` on the handler.

For example, this submit handler will actually submit the form to the server:

```
submit() {
  return true
}
```



### Event object

The event handler receives the standard event object as the first argument. The following properties are normalized to work across browsers:

- `e.relatedTarget` points to the element where the event handler is specified.
- `e.target` is the originating element. This is not necessarily the same as `relatedTarget`.
- `e.which` is the key code in a keyboard event (`keypress`, `keyup`, etc...).
- `e.data` is the current element in a loop. See [loops](#loops) for more details.


## Conditionals

Conditionals let you show / hide elements based on a condition. For example:

``` html
<div if={ is_premium }>
  <p>This is for premium users only</p>
</div>
```

Again, the expression can be just a simple property or a full JavaScript expression. The following special attributes are available:

- `show` – show the element using `style="display: ''"` when the value is true
- `hide` – hide the element using `style="display: none"` when the value is true
- `if` – add (true value) or remove (false value) the element from the document*

The equality operator is `==` and not `===`. For example: `'a string' == true`.

<small>Currently `if` is implemented with CSS display property as well.</small>



## Loops

Loops are implemented with `each` attribute as follows:

```
<todo>
  <ul>
    <li each={ items } class={ completed: done }>
      <input type="checkbox" checked={ done }> { title }
    </li>
  </ul>

  this.items = [
    { title: 'First item', done: true },
    { title: 'Second item' },
    { title: 'Third item' }
  ]
</todo>
```

The element with the `each` attribute will be repeated for all items in the array. New elements are automatically added / created when the items array is manipulated using `push()`, `slice()` or `splice` methods for example.


### Context

For each item a new context is created and the parent can be accessed with `parent.` prefix. For example:


```
<todo>
  <div each={ items }>
    <h3>{ title }</h3>
    <a onclick={ parent.remove }>Remove</a>
  </div>

  this.items = [ { title: 'First' }, { title: 'Second' } ]

  remove(event) {

  }
</todo>
```

In the looped element everything but the `each` attribute belongs to the child context, so the `title` can be accessed directly and `remove` needs to be prefixed with `parent.` since the method is not a property of the looped item.

The looped items are [tag instances](/riotjs/api/#tag-instance). Riot does not touch the original items so no new properties are added to them.


### Event handlers with looped items

Event handlers can access individual items in a collection with `event.data`. Now let's implement the `remove` function:

```
<todo>
  <div each={ items }>
    <h3>{ title }</h3>
    <a onclick={ parent.remove }>Remove</a>
  </div>

  this.items = [ { title: 'First' }, { title: 'Second' } ]

  remove(event) {

    // looped item
    var item = event.item

    // index on the collection
    var index = this.items.indexOf(item)

    // remove from collection
    this.items.splice(index, 1)
  }
</todo>
```

After the event handler is executed the current tag instance is updated using `this.update()` which causes all the looped items to execute as well. The parent notices that an item has been removed from the collection and removes the corresponding DOM node from the document.


### Looping custom tags

Custom tags can also be looped. For example:

``` html
<todo-item each="{ items }" data="{ this }"></todo-item>
```

The currently looped item can be referenced with `this` which you can use to pass the item as an option to the looped tag.


### Non-object arrays

The array elements need not be objects. They can be strings or numbers as well. In this case you need to use the `{ name, i in items }` construct as follows:


```
<my-tag>
  <p each="{ name, i in arr }">{ i }: { name }</p>

  this.arr = [ true, 110, Math.random(), 'fourth']
</my-tag>
```

The `name` is the name of the element and `i` is the index number. Both of these labels can be anything that's best suited for the situation.


### Object loops

Plain objects can also be looped. For example:

```
<my-tag>
  <p each="{ name, value in obj }">{ name } = { value }</p>

  this.obj = {
    key1: 'value1',
    key2: 1110.8900,
    key3: Math.random()
  }
</my-tag>
```

Object loops are not recommended since internally Riot detects changes on the object with `JSON.stringify`. The *whole* object is studied and when there is a change the whole loop is re-rendered. This can be slow. Normal arrays are much faster and only the changes are drawn on the page.



## Compiler

The `.tag` files needs to be transformed to `.js` files before the browser can execute them. Here's how you do it:

``` sh
# compile a file to current folder
riot some.tag

# compile file to target folder
riot some.tag some_folder

# compile file to target path
riot some.tag some_folder/some.js

# compile all tag files on a folder to target folder
riot some/folder path/to/dist
```

You can install the `riot` command line tool with `npm install -g riot`.

Compiled files can be normal JavaScript files with custom tags mixed together. There can be multiple custom tags in the same file.

Both HTML and JS comments are stripped from the resulting file and newlines are preserved inside `textarea` and `pre` tags. Compilation is a very lightweight process for the CPU.

### Watch mode

You can watch directories and automatically transform files when they are changed. For example:

`riot -w src dist`

Run `riot --help` for more information.


### Use as a Node module

Once [installed](/riotjs/download.html) with `npm` you can do as follows:

```
var riot_compile = require('riot/compiler')

var js = riot_compile(tag, { compact: true })
```

The compile function takes a string and returns a string.


### Creating tags manually

You can create cusom tags without the compiler using `riot.tag`. For example:

``` js
riot.tag('timer', '<p>Seconds Elapsed: { time }</p>', function (opts) {
  this.time = opts.start || 0

  this.tick = (function () {
    this.update({
        time: ++this.time
    })
  }).bind(this)

  var timer = setInterval(this.tick, 1000)

  this.on('unmount', function () {
    clearInterval(timer)
  })

})
```

See [timer demo](http://jsfiddle.net/gnumanth/h9kuozp5/) and [riot.tag](/riotjs/api/#tag) API docs for more details.


# Application architecture


## Tools, not policy

Riot comes bundled with custom tags, an event emitter (observable) and router. We believe that these are the fundamental building blocks for client- side applications:

1. Custom tags for the user interface,
2. Events for modularity and
3. Router for URL and the back button.

Riot tries not to give strict rules, but rather the basic tools that you can creatively use. This flexible approach leaves the bigger architectural decisions for the developer.

We also think that the basic blocks should be minimal. In terms of file size and API size. Elementary stuff should be simple. This eases your mind.


## Observable

Observable is a generic tool to send and receive events. It's a common pattern to isolate modules without forming a dependency or "coupling". By using events a large program can be broken into smaller and simpler units. Modules can be added/removed/modified without affecting the other parts of the application

A common practice is to split the application into a single core and multiple extensions. The core sends events any time something remarkable happens: new item is being added, existing item being removed or something is loaded from the server.

By using the observable the extensions can listen to these events and react to them. They extend the core so that the core is not aware of these modules. This is called "loose coupling".

These extensions can be custom tags (UI components) or non-UI modules.

Once core and the events are carefully designed the team members are enabled to develop the system on their own without disturbing others.

[Observable API](/riotjs/api/#observable)


## Routing

Riot router is a generic tool to take care of the URL and the back button. It's the smallest implementation you can find and it works on all browsers including IE8. It can do the following:

1. change the hash part of the URL,
2. notify when the hash changes and
3. study the current hash.

You can place routing logic everywhere; in custom tags or non-UI modules. Some application frameworks make router a central element that dispatches work to the other pieces of the application. Some take a milder approach where URL events are like keyboard events, not affecting the overall architecture.

Every browser application needs routing since there is always an URL in the location bar.

[Router API](/riotjs/api/#router)
