
## A React- like, 2.5KB user interface library

[![Riot logo](doc/logo/riot480x.png)](https://muut.com/riotjs/)

### Custom tags • Virtual DOM • Full stack • IE8

Riot brings custom tags to all browsers starting from IE8. Think React + Polymer, but squeezed into 5.7KB (2.5KB when gzipped).


#### Tag definition

``` javascript
<timer>

  <p>Seconds Elapsed: { time }</p>

  this.time = opts.start || 0

  tick() {
    this.update({ time: ++this.time })
  }

  var timer = setInterval(this.tick, 1000)

  this.on('unmount', function() {
    clearInterval(timer)
  })

</timer>
```

#### Mounting

``` javascript
riot.mount('timer', { start: 0 })
```

#### Nesting

Custom tags lets you build complex views with HTML.

``` html
<timetable>
  <timer start="0"></timer>
  <timer start="10"></timer>
  <timer start="20"></timer>
</timetable>
```

HTML syntax is the de facto language on the web and it's designed for building user interfaces. The syntax is explicit, nesting is inherent to the language and attributes offer a clean way to provide options for custom tags.


### Virtual DOM
- Smallest possible amount of DOM updates and reflows.
- All expressions are pre-compiled cached for high performance.
- No extra HTML root elements or `data-` attributes.
- No event loops or batching.


### Close to standards
- No proprietary event system.
- Event normalization for IE8.
- The rendered DOM can be freely manipulated with other tools.
- Plays well with jQuery.

### DEMOS
- [Simple TODO](https://muut.com/riotjs/dist/demo/)
- [Multi TODO](http://plnkr.co/edit/UZ2BfP?p=preview)
- [Timer](http://jsfiddle.net/gnumanth/h9kuozp5/)
- [Flux- like event controller for Riot](https://github.com/jimsparkman/RiotControl)

https://muut.com/riotjs/
