
title: Riot developer guide
subtitle: Guide
description: Developing client-side applications with Riot
minify: false

====

# Custom tag example

Riot custom tags are the building blocks for user interfaces. They make the "view" part of the application. Let's start with an extended TODO example highlighting various features of Riot:

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

  <script>
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
  </script>

</todo>
```

Custom tags are [compiled](compiler.html) to JavaScript.

See the [live demo](http://muut.github.io/riotjs/demo/), browse the [sources](https://github.com/muut/riotjs/tree/gh-pages/demo), or download the [zip](https://github.com/muut/riotjs/archive/gh-pages.zip).



### Tag syntax

A Riot tag is a combination of layout (HTML) and logic (JavaScript). Here are the basic rules:

* HTML is defined first and the logic is enclosed inside an optional `<script>` tag.
* Without the `<script>` tag the JavaScript starts where the last HTML tag ends.
* Custom tags can be empty, HTML only or JavaScript only
* Quotes are optional: `<foo bar={ baz }>` becomes `<foo bar="{ baz }">`.
* ES6 method syntax is supported: `methodName()` becomes `this.methodName = function()` and `this` variable always points to the current tag instance.
* A shorthand syntax for class names is available: `class={ completed: done }` renders to `class="completed"`when the value of `done` is a true value.
* Boolean attributes (checked, selected etc..) are ignored when the expression value is falsy: `<input checked={ undefined }>` becomes `<input>`.
* All attribute names must be *lowercase*.
* Self-closing tags are supported: `<div/>` equals `<div></div>`. Well known "open tags" such as `<br>`, `<hr>`, `<img>` or `<input>` are never closed after the compilation.
* Custom tags always need to be closed (normally or self-closed).
* Standard HTML tags (`label`, `table`, `a` etc..) can also be customized, but not necessarily a wise thing to do.



Tag definition always starts on the beginning of the line:

```
<!-- works -->
<my-tag>

</my-tag>

<!-- also works -->
<my-tag></my-tag>

  <!-- this fails, because of indentation -->
  <my-tag>

  </my-tag>
```

### No script tag

You can leave out the `<script>` tag:

```
<todo>

  <!-- layout -->
  <h3>{ opts.title }</h3>

  // logic comes here
  this.items = [1, 2, 3]

</todo>
```

In which case the logic starts after the last HTML tag. This "open syntax" is more commonly used on the examples on this website.


### Pre-processor

You can specify a pre-processor with `type` attribute. For example:

```
<script type="coffeescript">
  # your logic is here
</script>
````

Currently available options are "coffeescript", "typescript", "es6" and "none". You can also prefix the language with "text/", such as "text/coffeescript".

See [pre processors](/riotjs/compiler.html#pre-processors) for more details.


### Tag styling

You can put a `style` tag inside. Riot.js automatically takes it out and injects it into `<head>`.

```html
<todo>

  <!-- layout -->
  <h3>{ opts.title }</h3>

  <style>
    todo { display: block }
    todo h3 { font-size: 120% }
    /** other tag specific styles **/
  </style>

</todo>
```

### Scoped CSS

[Scoped CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/:scope) is also available. The example below is equivalent to the first one.

```html
<todo>

  <!-- layout -->
  <h3>{ opts.title }</h3>

  <style scoped>
    :scope { display: block }
    h3 { font-size: 120% }
    /** other tag specific styles **/
  </style>

</todo>
```

This happens once, no matter how many times the tag is initialized.

## Mounting

Once a tag is created you can mount it on the page as follows:


``` html
<body>

  <!-- place the custom tag anywhere inside the body -->
  <todo></todo>

  <!-- include riot.js -->
  <script src="riot.min.js"></script>

  <!-- include the tag -->
  <script src="todo.js" type="riot/tag"></script>

  <!-- mount the tag -->
  <script>riot.mount('todo')</script>

</body>
```

Custom tags inside the `body` of the page needs to be closed normally: `<todo></todo>` and self-closing: `<todo/>` is not supported.


Some example uses of the mount method:

``` js
// mount all custom tags on the page
riot.mount('*')

// mount an element with a specific id
riot.mount('#my-element')

// mount selected elements
riot.mount('todo, forum, comments')
```

A document can contain multiple instances of the same tag.


### Options

You can pass options for tags in the second argument

```
<script>
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

A tag is created in following sequence:

1. Tag's JavaScript logic is executed
2. HTML expressions are calculated and "update" event is fired
3. Tag is mounted on the page and "mount" event is fired

After the tag is mounted the expressions are updated as follows:

1. Automatically after an event handler is called. For example the `toggle` method in the above example.
2. When `this.update()` is called on the current tag instance
3. When `this.update()` is called on a parent tag, or any parent upwards. Updates flow uni-directionally from parent to child.
4. When `riot.update()` is called, which globally updates all expressions on the page.

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


### Printing brackets

You can output an expression without evaluation by escaping the opening bracket:

`\\{ this is not evaluated \\}` outputs `{ this is not evaluated }`


### Customizing brackets

You are free to customize the brackets to your liking. For example:

``` js
riot.settings.brackets = '${ }'
riot.settings.brackets = '\{\{ }}'
```

The start and end is separated with a space character.

When using [pre-compiler](compiler.html#pre-compilation) you'll have to set `brackets` option there as well.



### Etc

Expressions inside `style` tags are ignored.


### Render unescaped HTML

Riot expressions can only render text values without HTML formatting. However you can make a custom tag to do the job. For example:

```
<raw>
  <span></span>

  this.root.innerHTML = opts.content
</raw>
```

After the tag is defined you can use it inside other tags. For example

```
<my-tag>
  <p>Here is some raw content: <raw content="{ html }"/> </p>

  this.html = 'Hello, <strong>world!</strong>'
</my-tag>
```

[demo on jsfiddle](http://jsfiddle.net/23g73yvx/)

<span class="tag red">warning</span> this could expose the user to XSS attacks so make sure you never load data from an untrusted source.



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

<script>
riot.mount('account', { plan: { name: 'small', term: 'monthly' } })
</script>
```

Parent tag options are passed with the `riot.mount` method and child tag options are passed on the tag attribute.

<span class="tag red">important</span> Nested tags are always declared inside a parent custom tag. They are not initialized if they are defined on the page.

### Nested HTML

Here is an example of a custom tag with nested HTML on the page:

```
<body>
  <my-tag>
    <h3>Hello world!</h3>
  </my-tag>
</body>

<script>
riot.mount('my-tag')
</script>
```

We can access the inner HTML in a cute way by making a custom `inner-html` tag:

```
<my-tag>
  <p>Some tag specific markup</p>
  <!-- here comes the inner HTML defined on the page -->
  <inner-html/>
</my-tag>
```

Here is the `inner-html` source code:

```
<inner-html>
  var p = this.parent.root
  while (p.firstChild) this.root.appendChild(p.firstChild)
</inner-html>
```

The above tag will be part of Riot "core tags" to be introduced later.


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

Of course these named elements can be referred to in HTML as well: `<div>{ username.value }</div>`


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

- `e.currentTarget` points to the element where the event handler is specified.
- `e.target` is the originating element. This is not necessarily the same as `currentTarget`.
- `e.which` is the key code in a keyboard event (`keypress`, `keyup`, etc...).
- `e.item` is the current element in a loop. See [loops](#loops) for more details.


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
- `if` – add (true value) or remove (false value) the element from the document

The equality operator is `==` and not `===`. For example: `'a string' == true`.


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

A new context is created for each item and the parent can be accessed through the `parent` variable. For example:


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

Event handlers can access individual items in a collection with `event.item`. Now let's implement the `remove` function:

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


# Application design


## Tools, not policy

Riot comes bundled with custom tags, an event emitter (observable) and router. We believe that these are the fundamental building blocks for client- side applications:

1. Custom tags for the user interface,
2. Events for modularity and
3. Router for URL and the back button.

Riot tries not to enforce strict rules, but rather provide basic tools for you to use creatively. This flexible approach leaves the bigger architectural decisions up to the developer.

We also think that these building blocks should be minimal. In terms of file size and API size. Elementary stuff should be simple so there's minimal cognitive load.


## Observable

Observable is a generic tool to send and receive events. It's a common pattern to isolate modules without forming a dependency or "coupling". By using events a large program can be broken into smaller and simpler units. Modules can be added/removed/modified without affecting the other parts of the application

A common practice is to split the application into a single core and multiple extensions. The core sends events any time something remarkable happens: a new item is being added, an existing item is being removed or something is loaded from the server.

By using the observable the extensions can listen to these events and react to them. They extend the core so that the core is not aware of these modules. This is called "loose coupling".

These extensions can be custom tags (UI components) or non-UI modules.

Once the core and events are carefully designed the team members are enabled to develop the system on their own without disturbing others.

[Observable API](/riotjs/api/#observable)


## Routing

Riot router is a generic tool to take care of the URL and the back button. It's the smallest implementation you can find and it works on all browsers including IE8. It can do the following:

1. change the hash part of the URL,
2. notify when the hash changes and
3. study the current hash.

You can place routing logic everywhere; in custom tags or non-UI modules. Some application frameworks make router a central element that dispatches work to the other pieces of the application. Some take a milder approach where URL events are like keyboard events, not affecting the overall architecture.

Every browser application needs routing since there is always an URL in the location bar.

[Router API](/riotjs/api/#router)


## Modularity

Riot tags make the view part of your application. On modular application these tags should not be aware of each other and they shou be isolated. Ideally you can use the same tag on across projects regardless of the outer HTML layout.

If two tags know about each other they become depdendent and a "tight coupling" is introduced. These tags cannot be freely moved around without breaking the system.

To reduce coupling the idea is that the tags listen to events rather than call each other directly. What you need is a publish/subscribe system built with `riot.observable` or similar.

This event emitting system can range from a simple API to a larger architectural choice like Facebook Flux.

### Example Riot application design

Here is a very bare bones Riot application structure for user login:

```
// Login API
var auth = riot.observable()

auth.login = function(params) {
  $.get('/api', params, function(json) {
    auth.trigger('login', json)
  })
}


<!-- login view -->
<login>
  <form onsubmit="{ login }">
    <input name="username" type="text" placeholder="username">
    <input name="password" type="password" placeholder="password">
  </form>

  login() {
    opts.login({
      username: this.username.value,
      password: this.password.value
    })
  }

  // any tag on the system can listen to login event
  opts.on('login', function() {
    $(body).addClass('logged')
  })
</login>
```

And here we mount the application

```
<body>
  <login></login>
  <script>riot.mount('login', auth)</script>
</body>
```

On the above setup the other tags on the system do not need to know about each other since they can simply listen to the "login" event and do what they please.

Observable is a classic building block for a decoupled (modular) appliction.
