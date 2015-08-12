
[![Riot logo](doc/logo/riot480x.png)](https://muut.com/riotjs/)

## A React- like, 3.5KB UI lib

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
| Ember                  | 1.13.3     | 493.3kb       |
| Angular                | 1.4.2      | 145.5kb       |
| React                  | 0.13.3     | 121.7kb       |
| Web Components Polyfill| 0.7.5      | 117.1kb       |
| Polymer                | 1.0.6      | 101.2kb       |
| Riot                   | 2.2.3      | <span class="riot-size">13.21kb</span> |


### Custom tags • Concise syntax • Virtual DOM • Full stack • IE8

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
- Create tags with CoffeeScript, Jade, LiveScript, Typescript, ES6 or [any pre-processor](https://muut.com/riotjs/compiler.html#pre-processors) you want.
- Integrate with NPM, CommonJS, AMD, Bower or Component
- Develop with [Gulp](https://github.com/e-jigsaw/gulp-riot), [Grunt](https://github.com/ariesjia/grunt-riot), [Browserify](https://github.com/jhthorsen/riotify), or [Wintersmith](https://github.com/collingreen/wintersmith-riot) plugins


### Concise syntax
- Power shortcuts: `class={ enabled: is_enabled, hidden: hasErrors() }`.
- No extra brain load such as `render`, `state`, `constructor` or `shouldComponentUpdate`
- Interpolation: `Add #{ items.length + 1 }` or `class="item { selected: flag }"`
- Compact ES6 method syntax.

### Demos
- [Riot Todo MVC](https://github.com/txchen/feplay/tree/gh-pages/riot_todo)
- [Hackernews reader](http://git.io/riot-hn)
- [Vuejs examples by Riotjs](https://github.com/txchen/feplay/tree/gh-pages/riot_vue)
- [Flux-like ES6 Todo](https://github.com/srackham/riot-todo)
- [Simple TODO](https://muut.com/riotjs/dist/demo/)
- [Timer](http://jsfiddle.net/gnumanth/h9kuozp5/)
- [Another flux demo caparable to React ones](http://txchen.github.io/feplay/riot_flux)
- [Various experiments](http://richardbondi.net/programming/riot)
- [Isomorphic application](https://github.com/ListnPlay/riot-isomorphic)
- [flux-riot todo](http://mingliangfeng.me/flux-riot)
- [Another Riot Todo MVC](http://nippur72.github.io/riotjs-todomvc/#/)

### Tutorials
- [Building Apps with Riot, ES6 and Webpack](http://blog.srackham.com/posts/riot-es6-webpack-apps/)
- [Building Apps with Riot, Babel and Browserify](https://github.com/txchen/feplay/tree/gh-pages/riot_babel)
- [Building tabs with Riot](http://www.robertwpearce.com/blog/riotjs-example/)
- [The "React tutorial" for Riot](https://juriansluiman.nl/article/154/the-react-tutorial-for-riot)
- [How to package "tag libraries" in Riot](https://github.com/ivan-saorin/riot-tutorial-tags-pack-app)
- [Another React tutorial with Riot](https://github.com/viliamjr/commentsTuto)
- [Riot Custom Tag by Example](http://www.triplet.fi/blog/riot-custom-tag-by-example/)
- [Riot Compiler Explained](http://www.triplet.fi/blog/riot-compiler-explained/)
- [Adding compiled Riot tags to your Gulp + Browserify build](http://www.triplet.fi/blog/adding_compiled_riot_tags_to_your_gulp_browserify_build/)

### Video Tutorials
- [Introduction](https://www.youtube.com/watch?v=al87U6NgRTc)
- [Loops, Events and Callbacks](https://www.youtube.com/watch?v=T-ZV9dv93sw)
- [Server Rendering with Node & Express](http://youtu.be/6ww1UXGJzcs)

### Libraries
- [Flux- like event controller for Riot](https://github.com/jimsparkman/RiotControl)
- [flux-riot framework](https://github.com/mingliangfeng/flux-riot)
- [Cheftjs - chinese framework for Riot](https://github.com/cheft/cheftjs)

### Components
- [RiotGear](https://riotgear.js.org)
- [Riot Bootstrap](http://cognitom.github.io/riot-bootstrap/)
- [iToolkit](https://github.com/BE-FE/iToolkit)

### Resources
- [Riot + AngularJS](https://github.com/lucasbrigida/angular-riot)
- [Module loader for WebPack](https://www.npmjs.com/package/riotjs-loader)
- [Riot + Meteor]( https://atmospherejs.com/xaiki/riotjs)
- [Riot Snake Game](http://cdn.rawgit.com/atian25/blog/master/assets/riot-snake.html)
- [Riot Tag Syntax Checker](http://cognitom.github.io/riot-checker/)
- [Riot 文档中译版](https://github.com/Centaur/riotjs_doc_cn) :cn:
- [Riot + Wintersmith](https://github.com/collingreen/wintersmith-riot)
- [Riot precompiler plugin for lineman](https://github.com/Power-Inside/lineman-riot)
- [Riot Startkit - Flux inspired skeleton app + WebPack + PostCSS](https://github.com/wbkd/riotjs-startkit)
- [Yeoman generator - Generator riot mobile](https://www.npmjs.com/package/generator-riot-mobile)
- [Yeoman generator - Generator riot element](https://www.npmjs.com/package/generator-riot-element)
- [Riot for TypeScript](https://github.com/nippur72/RiotTS)

### Performance
- **Riot vs React performance:** [(Riot version)](https://github.com/kazzkiq/samples/tree/gh-pages/perf/dom-riot-vs-vanilla) vs [(React version)](https://github.com/kazzkiq/samples/tree/gh-pages/perf/dom-react-vs-vanilla)

### Miscellaneous
- [Q&A with RiotJS author Tero Piirainen](http://www.triplet.fi/blog/q-and-a-with-riotjs-author-tero-piirainen/)
- [riot-detector（Chrome Extension）](https://chrome.google.com/webstore/detail/riot-detector/cnnmjeggdmicjojlnjghdgkdlijiobke)


### Credits

Riot is made with :heart: by many smart people. Thanks to all the contributors

```
 project  : riot
 repo age : 1 year, 11 months
 active   : 392 days
 commits  : 1653
 files    : 213
 authors  :
   552  Gianluca Guarini        33.4%
   400  Tero Piirainen          24.2%
   150  Aurimas                 9.1%
    56  Tsutomu Kawamura        3.4%
    45  rsbondi                 2.7%
    43  Alberto Martínez       2.6%
    27  Marcelo Eden            1.6%
    20  Kalman Speier           1.2%
    18  Juha Lindstedt          1.1%
    18  Márcio Coelho          1.1%
    15  Anton Heryanto          0.9%
    14  andynemzek              0.8%
    14  Greg                    0.8%
    13  a-moses                 0.8%
    11  Hrvoje Šimić          0.7%
    10  Andy VanEe              0.6%
     9  Avner Peled             0.5%
     8  Richard Bondi           0.5%
     8  Mark Henderson          0.5%
     8  Andreas Heintze         0.5%
     7  Lee Tagg                0.4%
     7  marciojcoelho           0.4%
     7  Ashley Brener           0.4%
     7  Tianxiang Chen          0.4%
     7  Avnerus                 0.4%
     6  hemanth.hm              0.4%
     6  sethyuan                0.4%
     6  Jens Anders Bakke       0.4%
     5  jigsaw                  0.3%
     5  Tatu Tamminen           0.3%
     5  midinastasurazz         0.3%
     4  blissland               0.2%
     4  Jasmine Hegman          0.2%
     4  xieyu33333              0.2%
     4  Giovanni Cappellotto    0.2%
     4  Eric Baer               0.2%
     3  Artem Medeusheyev       0.2%
     3  scott                   0.2%
     3  Jim Sparkman            0.2%
     3  korige                  0.2%
     3  Alan R. Soares          0.2%
     3  Magnus Wolffelt         0.2%
     2  Mohammed Irfan          0.1%
     2  Eric Capps              0.1%
     2  Sergey Martynov         0.1%
     2  Simon JAILLET           0.1%
     2  Antonino Porcino        0.1%
     2  Steve Clay              0.1%
     2  Alexis THOMAS           0.1%
     2  Tim Kindberg            0.1%
     2  Tobias Baunbæk         0.1%
     2  Jon Wolfe               0.1%
     2  crazy2be                0.1%
     2  jmas                    0.1%
     2  luffs                   0.1%
     2  oldpig                  0.1%
     2  Andrew Feng             0.1%
     2  yibuyisheng             0.1%
     2  Žiga                   0.1%
     2  陈海峰               0.1%
     2  Bolt                    0.1%
     2  Andrew Kiellor          0.1%
     2  Markus A. Stone         0.1%
     2  Collin Green            0.1%
     2  Andrew Luetgers         0.1%
     2  Milosz                  0.1%
     2  Moot Inc                0.1%
     2  Mtpc                    0.1%
     2  Antoine Goutagny        0.1%
     2  Philippe CHARRIERE      0.1%
     2  David Salazar           0.1%
     1  kylobite                0.1%
     1  Andrew L. Van Slaars    0.1%
     1  Ari Makela              0.1%
     1  Barkóczi Dávid        0.1%
     1  Benoit Hirbec           0.1%
     1  Boris Huai              0.1%
     1  Claudio Holanda         0.1%
     1  Constantin Rack         0.1%
     1  Courtney Couch          0.1%
     1  Danil Semelenov         0.1%
     1  Eliseo Arias            0.1%
     1  Fernando Correia        0.1%
     1  Ian Walter              0.1%
     1  Ivan Saorin             0.1%
     1  Joel Thornton           0.1%
     1  Jonathan Dumaine        0.1%
     1  Jonny Buchanan          0.1%
     1  Jorrit Schippers        0.1%
     1  Justin Dorfman          0.1%
     1  Juwan Yoo               0.1%
     1  Liu Jin                 0.1%
     1  Marcin Jekot            0.1%
     1  Matthew McCullough      0.1%
     1  Maxence Dalmais         0.1%
     1  Mike Breen              0.1%
     1  Mike Ward               0.1%
     1  Patrik Buckau           0.1%
     1  Quim Calpe              0.1%
     1  Riccardo Gueli Alletti  0.1%
     1  Ryan O’Hara           0.1%
     1  Sam Morgan              0.1%
     1  Simone Vittori          0.1%
     1  Steel Brain             0.1%
     1  Steven Koch             0.1%
     1  TZ | 天猪             0.1%
     1  Tenor Biel              0.1%
     1  The Gitter Badger       0.1%
     1  Trent Ogren             0.1%
     1  Umut Sirin              0.1%
     1  XiongLiding             0.1%
     1  Zach Aysan              0.1%
     1  afc163                  0.1%
     1  borishuai               0.1%
     1  boynet                  0.1%
     1  h2so5                   0.1%
     1  jamesnolanverran        0.1%
     1  nino-porcino            0.1%
     1  typicode                0.1%
     1  xieyu03                 0.1%
     1  なりたけいすけ   0.1%
```

https://muut.com/riotjs/


[travis-image]:https://img.shields.io/travis/riot/riot.svg?style=flat-square
[travis-url]:https://travis-ci.org/riot/riot

[license-image]:http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square
[license-url]:LICENSE.txt

[npm-version-image]:http://img.shields.io/npm/v/riot.svg?style=flat-square
[npm-downloads-image]:http://img.shields.io/npm/dm/riot.svg?style=flat-square
[npm-url]:https://npmjs.org/package/riot

[riot-forum-image]:https://img.shields.io/badge/muut-JOIN_CHAT%E2%86%92-ff0044.svg?style=flat-square
[riot-forum-url]:https://muut.com/riotjs/forum/

[coverage-image]:https://img.shields.io/coveralls/riot/riot/dev.svg?style=flat-square
[coverage-url]:https://coveralls.io/r/riot/riot?branch=dev

[saucelabs-image]:https://saucelabs.com/browser-matrix/riotjs.svg
[saucelabs-url]:https://saucelabs.com/u/riotjs

[gitter-image]:https://img.shields.io/badge/GITTER-JOIN_CHAT_%E2%86%92-1dce73.svg?style=flat-square
[gitter-url]:https://gitter.im/riot/riot?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge

[codeclimate-image]:https://img.shields.io/codeclimate/github/riot/riot.svg?style=flat-square
[codeclimate-url]:https://codeclimate.com/github/riot/riot
