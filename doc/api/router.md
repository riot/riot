
nogen: true

====

# Router

The Riot Router is the most minimal router implementation you can find and it works consistently on all browsers including IE8. It only listens to changes on the URL hash (the part after the `#` character). Most single page applications deal with the hash only but if you really care about full URL changes you should use a different router implementation.

The Riot router is best in routing schemes in which the route's hierarchical parts, after the "#", are separated with the "/" character. In that case Riot gives you direct access to these parts.


### riot.route(callback) | #route

Execute the given `callback` when the URL hash changes. For example

``` js
riot.route(function(collection, id, action) {

})
```

If for example the hash changes to `#customers/987987/edit` then in the above example the arguments would be:


``` js
collection = 'customers'
id = '987987'
action = 'edit'
```

The hash can change in the following ways:

1. A new hash is typed into the location bar
2. When the back/forward buttons are pressed
3. When `riot.route(to)` is called

### riot.route.start() | #route-start

Start listening the window hash changes and it's automatically called when riot gets loaded.
Normally you should not use this method unless you are combining it with [route.stop](#route-stop)
for example:
``` js
riot.route.stop() // clear all the old riot.route callbacks
riot.route.start() // start again
```

### riot.route.stop() | #route-stop

Remove the hashchange listeners clearing also the [route.route](#route) callbacks
``` js
riot.route.stop()
```

### riot.route(to) | #route-to

Changes the browser URL and notifies all the listeners assigned with `riot.route(callback)`. For example:

``` javascript
riot.route('customers/267393/edit')
```

### riot.route.exec(callback) | #route-exec

Study the current hash "in place" using given `callback` without waiting for it to change. For example

``` js
riot.route.exec(function(collection, id, action) {

})
```

### riot.route.parser(parser) | #route-parser

Changes the default parser to a custom one. Here's one that parses paths like this:

`!/user/activation?token=xyz`

``` js
riot.route.parser(function(path) {
  var raw = path.slice(2).split('?'),
      uri = raw[0].split('/'),
      qs = raw[1],
      params = {}

  if (qs) {
    qs.split('&').forEach(function(v) {
      var c = v.split('=')
      params[c[0]] = c[1]
    })
  }

  uri.push(params)
  return uri
})
```

And here you'll receive the params when the URL changes:

```
riot.route(function(target, action, params) {

  /*
    target = 'user'
    action = 'activation'
    params = { token: 'xyz' }
  */

})
```
