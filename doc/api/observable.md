
nogen: true

====

# Observable

### riot.observable(el)

Adds [Observer](http://en.wikipedia.org/wiki/Observer_pattern) support for the given object `el` or if the argument is empty a new observable instance is created and returned. After this the object is able to trigger and listen to events. For example:

``` js
function Car() {

  // Make Car instances observable
  riot.observable(this)

  // listen to 'start' event
  this.on('start', function() {
    // engine started
  })

}

// make a new Car instance
var car = new Car()

// trigger 'start' event
car.trigger('start')
```

@returns the given object `el` or a new observable instance


### el.on(events, callback) | #observable-on

Listen to the given space separated list of `events` and execute the `callback` each time an event is triggered.

``` js
// listen to single event
el.on('start', function() {

})

// listen to multiple events, the event type is given as the argument
el.on('start stop', function(type) {

  // type is either 'start' or 'stop'

})
```

@returns `el`

### el.one(event, callback) | #observable-one

Listen to the given `event` and execute the `callback` at most once.

``` js
// run the function once, even if 'start' is triggered multiple times
el.one('start', function() {

})
```

@returns `el`

### el.off(events) | #observable-off

Removes the given space separated list of event listeners

``` js
el.off('start stop')
```

@returns `el`

### el.off(events, fn)

Removes the given callback from the list of events

``` js
function doIt() {
  console.log('starting or ending')
}

el.on('start middle end', doIt)

// remove a specific listener from start and end events
el.off('start end', doIt)
```

@returns `el`

### el.off('*')

Removes all listeners from all event types.

@returns `el`


### el.trigger(event) | #observable-trigger

Execute all callback functions that listen to the given `event`

``` js
el.trigger('start')
```

@returns `el`

### el.trigger(event, arg1 ... argN)

Execute all callback functions that listen to the given `event`. Any number of extra parameters can be provided for the listeners.

``` js
// listen to 'start' event and expect extra arguments
el.on('start', function(engine_details, is_rainy_day) {

})

// trigger start event with extra parameters
el.trigger('start', { fuel: 89 }, true)

```

@returns `el`
