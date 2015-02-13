f
nogen: true

====

# Custom tags

### riot.mount(selector, [opts]) | #mount

Mounts (constructs) all custom tags on the document specified by `selector`. Optional `opts` object is passed to the tags for consumption. Examples:

``` js
// mount all <plans> and <pricing> tags on the page
riot.mount('plans pricing')

// mount all custom tags with a class name .customer
riot.mount('.customer')

// mount <account> tag and pass an API object as options
riot.mount('account', api)
```

The passed options can be anything, ranging from a simple object to a full application API. Or it can be a Flux- store. Really depends on how you want to structure your client-side applications.

Internally the selector is passed to `document.querySelectorAll(selector)`. A special Riot specific selector "*" can be used to mount all custom tags on the page:

``` js
riot.mount('*')
```

@returns: an array of [tag instances](#tag-instance)


### riot.mountTo(domNode, tagName, [opts]) | #mount-to

Mount a custom tag named `tagName` on a given `domNode` passing optional data with `opts`. For example:

``` js
riot.mountTo(document.getElementById('slide'), 'users', api)
```

This is helpful in the case in which you find you often need to install a different tag on the same DOM node (ie. slideshows, dialogs, alert boxes) or when you want to enrich existing DOM nodes with Riot tags but you can't place custom tags in the markup because it's out of your control.


## Tag instance

Following properties are set for each tag instance:

- `opts` - the options object
- `parent` - the parent tag if any
- `root` - root DOM node

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


### this.update() | #tag-update

Updates all the expressions on the current tag instance as well as on all the children. This method is automatically called every time an event handler is called when user interacts with the application.

Other than that riot does not update the UI automatically so you need to call this method manually. This typically happens after some non-UI related event: after `setTimeout`, AJAX call or on some server event. For example:

``` html
<my-tag>

  <input name="username" onblur={ validate }>
  <span class="tooltip" show={ error }>{ error }</my-tag>

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


### riot.tag(tagName, html, [constructor]) | #tag

Creates a new custom tag "manually" without the compiler.

- `tagName` the tag name
- `html` is the layout with [expressions](/riotjs/guide/#expressions)
- `constructor` is the initialization function being called before the tag expressions are calculated and before the tag is mounted


#### Example

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

See [timer demo](http://jsfiddle.net/gnumanth/h9kuozp5/) and [riot.tag](/riotjs/api/#tag) API docs for more details and *limitations*.


<span class="tag red">Warning</span> by using `riot.tag` you cannot enjoy the advantages of compiler and following features are not supported:

1. Self- closing tags
2. Unquoted expressions. Write `value="{ val }"` instead of `value={ val }`
3. Boolean attributes. Write `__checked="{ flag }"` instead of `checked={ flag }`
4. Shorthand ES6 method signatures
5. `this.update()` must be manually called on an event handler

You can take advantage of `template` or `script` tags as follows:

```
&lt;script type="tmpl" id="my_tmpl">
  <h3>{ opts.hello }</h3>
  <p>And a paragraph</p>
</script>

&lt;script>
riot.tag('tag-name', my_tmpl.innerHTML, function(opts) {

})
</script>
```

This method is on the edge of being depreciated.



### riot.update() | #update

Updates all the mounted tags and their expressions on the page.

@returns: an array of [tag instances](#tag-instance) that are mounted on the page.


