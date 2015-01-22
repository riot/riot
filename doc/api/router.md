
nogen: true

====

# Router

Riot router is the most minimal router implementation you can find and it works consistently on all browsers including IE8. It only listen to changes on the URL hash (the part after the `#` character). Most single page applications deal with the hash only but if you really care about full URL changes you should use a different router implementation.

The Riot router is best in routing schemes in which the route's hierarchical parts, after the "#", are separated with the "/" character. In that case Riot gives you direct access to these parts.


### riot.route(callback) | #riot-route

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


### riot.route(to) | #riot-route-to

Changes the browser URL and notifies all the listeners assigned with `riot.route(callback)`. For example:

``` javascript
riot.route('customers/267393/edit')
```

### riot.route.exec() | #riot-route-exec

Study the current hash "in place" without waiting for it to change. For example

``` js
riot.route.exec(function(collection, id, action) {

})
```
