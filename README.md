
[![Riot logo](http://riotjs.com/img/logo/riot480x.png)](http://riotjs.com/)

## A React-like user interface micro-library

[![Build Status][travis-image]][travis-url]
[![Riot Forum][riot-forum-image]][riot-forum-url]
[![Join the chat at https://gitter.im/riot/riot][gitter-image]][gitter-url]

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Code Quality][codeclimate-image]][codeclimate-url]


[![Sauce Test Status][saucelabs-image]][saucelabs-url]

### Framework Size Comparison

| Framework              | Version    | Minified Size |
|------------------------|------------|---------------|
| Ember                  | 2.2.0      | 446.0kb       |
| Polymer                | 1.0.6      | 183.0kb       |
| Angular                | 1.4.8      | 148.0kb       |
| React                  | 0.14.3     | 136.0kb       |
| Web Components Polyfill| 0.7.19     | 118.0kb       |
| Riot                   | 2.3.11     | 20kb          |


### Custom tags • Concise syntax • Virtual DOM • Full stack

Riot brings custom tags to all browsers, including IE8. Think React + Polymer but with enjoyable syntax and a small learning curve.


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

[Open this example on Plunker](http://riotjs.com/examples/plunker/?app=timer)

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
- Create tags with CoffeeScript, Jade, LiveScript, Typescript, ES6 or [any pre-processor](http://riotjs.com/guide/compiler/#pre-processors) you want.
- Integrate with NPM, CommonJS, AMD, Bower or Component
- Develop with [Gulp](https://github.com/e-jigsaw/gulp-riot), [Grunt](https://github.com/ariesjia/grunt-riot), [Browserify](https://github.com/jhthorsen/riotify), or [Wintersmith](https://github.com/collingreen/wintersmith-riot) plugins

### CDN hosting
- [jsDelivr](http://www.jsdelivr.com/projects/riot)
- [cdnjs](https://cdnjs.com/libraries/riot)


### Concise syntax
- Power shortcuts: `class={ enabled: is_enabled, hidden: hasErrors() }`.
- No extra brain load such as `render`, `state`, `constructor` or `shouldComponentUpdate`
- Interpolation: `Add #{ items.length + 1 }` or `class="item { selected: flag }"`
- Compact ES6 method syntax.

### Demos
- [**Riot Examples** - Community's Official](https://github.com/riot/examples)
- [Riot Todo MVC](http://todomvc.com/examples/riotjs/)
- [Hackernews reader](http://git.io/riot-hn)
- [Vuejs examples by Riotjs](https://github.com/txchen/feplay/tree/gh-pages/riot_vue)
- [Flux-like ES6 Todo](https://github.com/srackham/riot-todo)
- [Simple TODO](https://muut.com/riotjs/dist/demo/)
- [Timer](http://jsfiddle.net/gnumanth/h9kuozp5/)
- [Another flux demo comparable to React ones](http://txchen.github.io/feplay/riot_flux)
- [Various experiments](http://richardbondi.net/programming/riot)
- [Isomorphic application](https://github.com/ListnPlay/riot-isomorphic)
- [Isomorphic proof of concept](https://github.com/PabloSichert/isomorphic-proof-of-concept)
- [flux-riot todo](http://mingliangfeng.me/flux-riot)
- [Another Riot Todo MVC](http://nippur72.github.io/riotjs-todomvc/#/)
- [Cheft isomorphic by express](https://github.com/cheft/cheft)

### Tutorials
- [Building Apps with Riot, ES6 and Webpack](http://blog.srackham.com/posts/riot-es6-webpack-apps/)
- [Building Apps with Riot, Babel, RiotControl and Webpack](https://github.com/txchen/feplay/tree/gh-pages/riot_webpack)
- [Building tabs with Riot](http://www.robertwpearce.com/blog/riotjs-example/)
- [The "React tutorial" for Riot](https://juriansluiman.nl/article/154/the-react-tutorial-for-riot)
- [How to package "tag libraries" in Riot](https://github.com/ivan-saorin/riot-tutorial-tags-pack-app)
- [Another React tutorial with Riot](https://github.com/viliamjr/commentsTuto)
- [Riot Custom Tag by Example](http://www.triplet.fi/blog/riot-custom-tag-by-example/)
- [Riot Compiler Explained](http://www.triplet.fi/blog/riot-compiler-explained/)
- [Adding compiled Riot tags to your Gulp + Browserify build](http://www.triplet.fi/blog/adding_compiled_riot_tags_to_your_gulp_browserify_build/)
- [The anatomy of a tag - a primer tutorial](http://www.marcusoft.net/2015/12/riotjs-anatomy-of-a-tag.html)

### Video Tutorials
- [Introduction](https://www.youtube.com/watch?v=al87U6NgRTc)
- [Loops, Events and Callbacks](https://www.youtube.com/watch?v=T-ZV9dv93sw)
- [Server Rendering with Node & Express](http://youtu.be/6ww1UXGJzcs)

### Libraries / Frameworks
- [Flux- like event controller for Riot](https://github.com/jimsparkman/RiotControl)
- [flux-riot framework](https://github.com/mingliangfeng/flux-riot)
- [Cheftjs - chinese framework for Riot](https://github.com/cheft/cheftjs)
- [Veronica - flux adaption for Riot](https://www.npmjs.com/package/veronica-x)

### Components
- [Material UI](http://kysonic.github.io/riot-mui/)
- [RiotGear](https://riotgear.js.org)
- [Riot Bootstrap](http://cognitom.github.io/riot-bootstrap/)
- [iToolkit](https://github.com/BE-FE/iToolkit)
- [Riot Routehandler](https://github.com/crisward/riot-routehandler)-[(Demo)](http://codepen.io/crisward/pen/xwGJpM?editors=101)
- [Riot Grid](https://github.com/crisward/riot-grid) - [(Demo)](http://codepen.io/crisward/pen/rxepMX?editors=101)
- [ESLint Riot Plugin](https://github.com/txchen/eslint-plugin-riot)
- [riot-animate](https://github.com/sartaj/riot-animate)

### Resources
- [Riot + AngularJS](https://github.com/lucasbrigida/angular-riot)
- [Module loader for WebPack](https://www.npmjs.com/package/riotjs-loader)
- [Riot + Meteor]( https://atmospherejs.com/baysao/riotjs)
- [Riot Snake Game](http://cdn.rawgit.com/atian25/blog/master/assets/riot-snake.html)
- [Riot Tag Syntax Checker](http://cognitom.github.io/riot-checker/)
- [Riot 文档中译版](https://github.com/Centaur/riotjs_doc_cn) :cn:
- [Riot + Wintersmith](https://github.com/collingreen/wintersmith-riot)
- [Riot precompiler plugin for lineman](https://github.com/Power-Inside/lineman-riot)
- [Riot Startkit - Flux inspired skeleton app + WebPack + PostCSS](https://github.com/wbkd/riotjs-startkit)
- [Yeoman generator - Generator riot mobile](https://www.npmjs.com/package/generator-riot-mobile)
- [Yeoman generator - Generator riot element](https://www.npmjs.com/package/generator-riot-element)
- [Riot for TypeScript](https://github.com/nippur72/RiotTS)
- [Sublime Syntax Highlighting for Riot Tag Files](https://github.com/crisward/sublime-tag)
- [Riot loader plugin for RequireJS](https://github.com/amenadiel/requirejs-riot)
- [Riot loader plugin for JSPM/SystemJS](https://github.com/amenadiel/systemjs-riot)

### Performance
- **Riot vs React performance:** [(Riot version)](https://github.com/kazzkiq/samples/tree/gh-pages/perf/dom-riot-vs-vanilla) vs [(React version)](https://github.com/kazzkiq/samples/tree/gh-pages/perf/dom-react-vs-vanilla)

### Miscellaneous
- [Q&A with RiotJS author Tero Piirainen](http://www.triplet.fi/blog/q-and-a-with-riotjs-author-tero-piirainen/)
- [riot-detector (Chrome Extension)](https://chrome.google.com/webstore/detail/riot-detector/cnnmjeggdmicjojlnjghdgkdlijiobke)
- [riot (Atom Package)](https://atom.io/packages/riot)

### Credits

Riot is made with :heart: by many smart people from all over the world. Thanks to all the contributors<br>
It's actively maintained by:
 - [Richard Bondi](https://github.com/rsbondi)
 - [Gianluca Guarini](https://github.com/GianlucaGuarini)
 - [Tsutomu Kawamura](https://github.com/cognitom)
 - [Alberto Martínez](https://github.com/aMarCruz)
 - [Tero Piirainen](https://github.com/tipiirai)

http://riotjs.com/

[travis-image]:https://img.shields.io/travis/riot/riot.svg?style=flat-square
[travis-url]:https://travis-ci.org/riot/riot

[license-image]:http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square
[license-url]:LICENSE.txt

[npm-version-image]:http://img.shields.io/npm/v/riot.svg?style=flat-square
[npm-downloads-image]:http://img.shields.io/npm/dm/riot.svg?style=flat-square
[npm-url]:https://npmjs.org/package/riot

[riot-forum-image]:https://img.shields.io/badge/muut-JOIN_CHAT%E2%86%92-ff0044.svg?style=flat-square
[riot-forum-url]:http://riotjs.com/forum/

[coverage-image]:https://img.shields.io/coveralls/riot/riot/dev.svg?style=flat-square
[coverage-url]:https://coveralls.io/r/riot/riot?branch=dev

[saucelabs-image]:https://saucelabs.com/browser-matrix/testsriotjs.svg
[saucelabs-url]:https://saucelabs.com/u/testsriotjs

[gitter-image]:https://img.shields.io/badge/GITTER-JOIN_CHAT_%E2%86%92-1dce73.svg?style=flat-square
[gitter-url]:https://gitter.im/riot/riot?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge

[codeclimate-image]:https://img.shields.io/codeclimate/github/riot/riot.svg?style=flat-square
[codeclimate-url]:https://codeclimate.com/github/riot/riot

