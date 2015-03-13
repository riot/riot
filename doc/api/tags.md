
nogen: true

====

# Custom tags

### riot.mount(customTagSelector, [opts]) | #mount

Where

- `customTagSelector` selects elements from the page and mounts them with a custom tag. The selected elements' name must match the custom tag name.
- `opts` optional object is passed for the tags to consume. This can be anything, ranging from a simple object to a full application API. Or it can be a Flux- store. Really depends on how you want to structure your client-side applications. Read more about [modular Riot applications](/riotjs/guide/#modularity).


``` js
// selects and mounts all <pricing> tags on the page
var tags = riot.mount('pricing')

// mount all custom tags with a class name .customer
var tags = riot.mount('.customer')

// mount <account> tag and pass an API object as options
var tags = riot.mount('account', api)
```

@returns: an array of the mounted [tag instances](#tag-instance)

### riot.mount('*', [opts]) | #mount-star.

A special Riot specific selector "*" can be used to mount all custom tags on the page:

``` js
riot.mount('*')
```

@returns: an array of the mounted [tag instances](#tag-instance)


### riot.mount(selector, tagName, [opts]) | #mount-tag

Where

- `selector` selects any DOM nodes from the page to be mounted
- `tagName` specifies the custom tag name to be used
- `opts` optional object is passed for the tags to consume


``` js
// mounts custom tag "my-tag" to div#main and pass api as options
var tags = riot.mount('div#main', 'my-tag', api)
```

@returns: an array of the mounted [tag instances](#tag-instance)


### riot.mount(domNode, tagName, [opts]) | #mount-dom

Mount a custom tag named tagName on a given domNode passing optional data with opts. For example:

```
// mounts "my-tag" to given DOM node
riot.mount(document.getElementById('slide'), 'users', api)
```

@returns: mounted [tag instance](#tag-instance)


### riot.mountTo(domNode, tagName, [opts]) | #mount-to

This method is deprecated since *v2.0.11*. This is the same as `riot.mount(domNode, tagName, [opts])`.


## Tag instance

Following properties are set for each tag instance:

- `opts` - the options object
- `parent` - the parent tag if any
- `root` - root DOM node
- `tags` - nested custom tags


You can use these references in both the HTML and JavaScript code. For example:


``` html
<my-tag>
  <h3>{ opts.title }</h3>

  var title = opts.title
</my-tag>
```

You can freely set any data to the instance (aka "context") and they are available in the HTML expressions. For example:

``` html
<my-tag>
  <h3>{ title }</h3>

  this.title = opts.title
</my-tag>
```

### Nested tags

You have access to nested tag instances via `tags` variable:

``` html
<my-tag>

  <child></child>

  // access to child tag
  var child = this.tags.child

</my-tag>
```

You can also use the `name` attribute to give another name for the nested tag.

``` html
<my-tag>

  <child name="my_nested_tag"></child>

  // access to child tag
  var child = this.tags.my_nested_tag

</my-tag>
```

The child tags are initialized after the parent tag so the methods and properties are available on the "mount" event.

``` html
<my-tag>

  <child name="my_nested_tag"></child>

  // access to child tag methods
  this.on('mount', function() {
    this.tags.my_nested_tag.someMethod()
  })

</my-tag>
```


### this.update() | #tag-update

Updates all the expressions on the current tag instance as well as on all the children. This method is automatically called every time an event handler is called when user interacts with the application.

Other than that riot does not update the UI automatically so you need to call this method manually. This typically happens after some non-UI related event: after `setTimeout`, AJAX call or on some server event. For example:

``` html
<my-tag>

  <input name="username" onblur={ validate }>
  <span class="tooltip" show={ error }>{ error }</span>

  var self = this

  validate() {
    $.get('/validate/username/' + this.username.value)
      .fail(function(error_message) {
        self.error = error_message
        self.update()
      })
  }
</my-tag>
```

On above example the error message is displayed on the UI after the `update()` method has been called. We assign `this` variable to `self` since inside the AJAX callback `this` variable points to the response object and not to the tag instance.


### this.update(data) | #tag-update-data

Set values of the current instance and update the expressions. This is same as `this.update()` but allows you to set context data at the same time. So instead of this:

``` js
self.error = error_message
self.update()
```

you can do this:

``` js
self.update({ error: error_message })
```

which is shorter and cleaner.


### this.unmount() | #tag-unmount

Detaches the tag and it's children from the page. An "unmount" event is fired.


#### Events

Each tag instance is an [observable](#observable) so you can use `on` and `one` methods to listen to the events that happen on the tag instance. Here's the list of supported events:


- "update" – right before the tag is updated. allows recalculation of context data before the UI expressions are updated.
- "mount" – right after tag is mounted on the page
- "unmount" – after the tag is removed from the page

For example:

``` js
// cleanup resources after tag is no longer part of DOM
this.on('unmount', function() {
  clearTimeout(timer)
})
```

#### Reserved words

The above method and property names are reserved words for Riot tags. Don't use any of following as your instance variable or method name: `opts`, `parent`, `root`, `update`, `unmount`, `on`, `off`, `one` and `trigger`. Local variables can be freely named. For example:

``` html
<my-tag>

  // allowed
  function update() { } 

  // not allowed
  this.update = function() { }

  // not allowed
  update() {

  }

</my-tag>
```


### riot.tag(tagName, html, [css], [constructor]) | #tag

Creates a new custom tag "manually" without the compiler.

- `tagName` the tag name
- `html` is the layout with [expressions](/riotjs/guide/#expressions)
- `css` is the style for the tag (optional)
- `constructor` is the initialization function being called before the tag expressions are calculated and before the tag is mounted


#### Example

``` js
riot.tag('timer',
  '<p>Seconds Elapsed: { time }</p>',
  'timer { display: block; border: 2px }',
  function (opts) {
    var self = this
    this.time = opts.start || 0

    this.tick = function () {
      self.update({ time: ++this.time })
    }

    var timer = setInterval(this.tick, 1000)

    this.on('unmount', function () {
      clearInterval(timer)
    })

  })
```

See [timer demo](http://jsfiddle.net/gnumanth/h9kuozp5/) and [riot.tag](/riotjs/api/#tag) API docs for more details and *limitations*.


<span class="tag red">Warning</span> by using `riot.tag` you cannot enjoy the advantages of compiler and following features are not supported:

1. Self- closing tags
2. Unquoted expressions. Write `value="{ val }"` instead of `value={ val }`
3. Boolean attributes. Write `__checked="{ flag }"` instead of `checked={ flag }`
4. Shorthand ES6 method signatures
5. `<img src={ src }>` must be written as `<img riot-src={ src }>` in order to avoid illegal server requests
6. `style="color: { color }"` must be written as `riot-style="color: { color }"` so that style attribute expressions work in IE.


You can take advantage of `<template>` or `<script>` tags as follows:

```
<script type="tmpl" id="my_tmpl">
  <h3>{ opts.hello }</h3>
  <p>And a paragraph</p>
</script>

<script>
riot.tag('tag-name', my_tmpl.innerHTML, function(opts) {

})
</script>
```

This method is on the edge of being deprecated.


### riot.update() | #update

Updates all the mounted tags and their expressions on the page.

@returns: an array of [tag instances](#tag-instance) that are mounted on the page.


