
## A React- like, 2.5KB user interface library

[![Riot logo](doc/logo/riot480x.png)](https://muut.com/riotjs/)

### Custom tags • Minimal syntax • Virtual DOM • Full stack • IE8

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
- Absolutely the smallest possible amount of DOM updates and reflows.
- One way data flow: updates and unmounts are propagated downwards from parent to children.
- Expressions are pre-compiled and cached for high performance.
- Lifecycle events for more control.


### Close to standards
- No proprietary event system.
- Event normalization for IE8.
- The rendered DOM can be freely manipulated with other tools.
- No extra HTML root elements or `data-` attributes.
- Plays well with jQuery.


### Use your dearest language and tools
- Create tags with CoffeeScript, Jade, Typescript, ES6 or [any pre-processor](https://muut.com/riotjs/compiler.html#pre-processors) you want.
- Integrate with NPM, CommonJS, AMD, Bower or Component
- Develop with [Gulp](https://github.com/e-jigsaw/gulp-riot), [Grunt](https://github.com/ariesjia/grunt-riot) or [Browserify](https://github.com/jhthorsen/riotify) plugins


### Minimal syntax
- Power shortcuts: `class={ enabled: is_enabled, hidden: hasErrors() }`.
- No extra brain load such as `render`, `state`, `constructor` or `shouldComponentUpdate`
- Interpolation: `Add #{ items.length + 1 }` or `class="item { selected: flag }"`
- Compact ES6 method syntax.


### Demos
- [Simple TODO](https://muut.com/riotjs/dist/demo/)
- [Multi TODO](http://plnkr.co/edit/UZ2BfP?p=preview)
- [Timer](http://jsfiddle.net/gnumanth/h9kuozp5/)
- [Flux- like event controller for Riot](https://github.com/jimsparkman/RiotControl)
- [Multi- selector](http://plnkr.co/edit/NmcxgZ?p=preview)


### Tutorials
- [Building tabs with Riot](http://www.robertwpearce.com/blog/riotjs-example/)
- [The "React tutorial" for Riot](https://juriansluiman.nl/article/154/the-react-tutorial-for-riot)
- [How to package "tag libraries" in Riot](https://github.com/ivan-saorin/riot-tutorial-tags-pack-app)


### Resources
- [Riot + Angular](https://github.com/lucasbrigida/angular-riot)
- [Module loader for WebPack](https://www.npmjs.com/package/riotjs-loader)
- [Riot module for AngularJS](https://github.com/lucasbrigida/angular-riot)
- [Riot + Meteor]( https://atmospherejs.com/xaiki/riotjs)
- [Riot on CodeClimate](https://codeclimate.com/github/muut/riotjs/code)


https://muut.com/riotjs/

