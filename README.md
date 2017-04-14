
[![Riot logo](http://riotjs.com/img/logo/riot480x.png)](http://riotjs.com/)

## Simple and elegant component-based UI library

[![Build Status][travis-image]][travis-url]
[![Riot Forum][riot-forum-image]][riot-forum-url]
[![Join the chat at https://gitter.im/riot/riot][gitter-image]][gitter-url]
[![Join the chat (ja) at https://riot-jp-slackin.herokuapp.com/][slack-ja-image]][slack-ja-url]
[![OpenCollective Backers][backer-badge]][backer-url] [![OpenCollective Sponsors][sponsor-badge]][sponsor-url]

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Code Quality][codeclimate-image]][codeclimate-url]

[![Sauce Test Status][saucelabs-image]][saucelabs-url]

### Framework Size Comparison

| Framework                                      | Version         | Minified Size (gzip) |
|------------------------------------------------|-----------------|----------------------|
| Angular                                        | 4               | too much             |
| Ember                                          | 2.12.0          | 131.92kb             |
| Polymer + Web Components Polyfill Lite         | 1.8.0           | 66.3kb               |
| React                                          | 15.4.2          | 45.06kb              |
| Web Components Polyfill                        | 0.7.22          | 33.68kb              |
| Vue                                            | 2.2.6           | 27.87kb              |
| __Riot__                                       | 3.4.2           | 9.87kb               |
| Inferno                                        | 3.0.4           | 9.04kb               |
| Preact                                         | 8.1.0           | 3.33kb               |

### Browsers support

Riot is supported by all modern browsers and it does not require any additional polyfill

- IE 9+
- Edge
- Chrome
- Safari 7+
- Firefox
- Safari iOS
- Android

### Custom tags • Concise syntax • Simple API • Tiny Size

Riot brings custom tags to all modern browsers. Think React + Polymer but with enjoyable syntax and a small learning curve.

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


### Expressions Bindings
- Absolutely the smallest possible amount of DOM updates and reflows.
- One way data flow: updates and unmounts are propagated downwards from parent to children.
- Expressions are pre-compiled and cached for high performance.
- Lifecycle events for more control.


### Close to standards
- No proprietary event system.
- Event normalization.
- The rendered DOM can be freely manipulated with other tools.
- No extra HTML root elements or `data-` attributes.
- Plays well with jQuery.


### Use your dearest language and tools
- Create tags with CoffeeScript, Jade, LiveScript, Typescript, ES6 or [any pre-processor](http://riotjs.com/guide/compiler/#pre-processors) you want.
- Integrate with NPM, CommonJS, AMD, Bower or Component
- Develop with [Gulp](https://github.com/e-jigsaw/gulp-riot), [Grunt](https://github.com/ariesjia/grunt-riot), [Wintersmith](https://github.com/collingreen/wintersmith-riot), [webpack*](https://github.com/riot/tag-loader), [Rollup*](https://github.com/riot/rollup-plugin-riot), [Browserify*](https://github.com/riot/riotify), [Babel*](https://github.com/riot/babel-preset-es2015-riot) or Bublé
- Test with [Karma*](https://github.com/riot/karma-riot), Mocha or whatever you like

*Note*: `*` officially maintained

### CDN hosting
- [jsDelivr](http://www.jsdelivr.com/projects/riot)
- [cdnjs](https://cdnjs.com/libraries/riot)


### Concise syntax
- Power shortcuts: `class={ enabled: is_enabled, hidden: hasErrors() }`.
- No extra brain load such as `render`, `state`, or `constructor`.
- Interpolation: `Add #{ items.length + 1 }` or `class="item { selected: flag }"`
- Compact ES6 method syntax.

### Demos
- [**Riot Examples** - Community's Official](https://github.com/riot/examples)
- [Riot Todo MVC](http://todomvc.com/examples/riotjs/)
- [Hackernews reader](http://git.io/riot-hn)
- [Vuejs examples by Riotjs](https://github.com/txchen/feplay/tree/gh-pages/riot_vue)
- [Flux-like ES6 Todo](https://github.com/srackham/riot-todo)
- [Timer](http://jsfiddle.net/gnumanth/h9kuozp5/)
- [Another flux demo comparable to React ones](http://txchen.github.io/feplay/riot_flux)
- [Various experiments](http://richardbondi.net/programming/riot)
- [Isomorphic application](https://github.com/ListnPlay/riot-isomorphic)
- [Isomorphic proof of concept](https://github.com/PabloSichert/isomorphic-proof-of-concept)
- [flux-riot todo](http://mingliangfeng.me/flux-riot)
- [Another Riot Todo MVC](http://nippur72.github.io/riotjs-todomvc/#/)
- [Cheft isomorphic by express](https://github.com/cheft/cheft)
- [electron-riot - Riot in an electron application](https://github.com/mike-ward/electron-riot)
- [An express, riot, jade, webpack simple boilerplate](https://github.com/revington/frontend-boilerplate)
- [Riot.js vs React.js comparison of a simple comment box](https://github.com/vitogit/riot.js-vs-react.js-comment-box)
- [Riot Seed project - webpack, routing, ava tests, dispatcher](https://github.com/continuata/riot-seed)
- [Riot-Redux League Table example](https://github.com/drewmiley/PoolLeague)
- [Riot vs React vs Ractive Counters using Redux store](https://github.com/drewmiley/ractive-react-riot-redux-counters-example)

### Tutorials
- [Building Apps with Riot, ES6 and Webpack](http://blog.srackham.com/posts/riot-es6-webpack-apps/)
- [Building Apps with Riot, Babel, RiotControl and Webpack](https://github.com/txchen/feplay/tree/gh-pages/riot_webpack)
- [Building tabs with Riot](http://robertwpearce.com/blog/riotjs-example.html)
- [The "React tutorial" for Riot](https://juriansluiman.nl/article/154/the-react-tutorial-for-riot)
- [How to package "tag libraries" in Riot](https://github.com/ivan-saorin/riot-tutorial-tags-pack-app)
- [Another React tutorial with Riot](https://github.com/viliamjr/commentsTuto)
- [Riot Custom Tag by Example](http://www.triplet.fi/blog/riot-custom-tag-by-example/)
- [Riot Compiler Explained](http://www.triplet.fi/blog/riot-compiler-explained/)
- [Adding compiled Riot tags to your Gulp + Browserify build](http://www.triplet.fi/blog/adding_compiled_riot_tags_to_your_gulp_browserify_build/)
- [The anatomy of a tag - a primer tutorial](http://www.marcusoft.net/2015/12/riotjs-anatomy-of-a-tag.html)
- [Using TDD with Riot+mocha+chai](http://vitomd.com/blog/coding/tutorial_tdd_riot_mocha/)
- [The Basics - from ground up to connected tag-networks](http://happy-css.com/lessons/riotjs/)
- [Hello Riot.js : a quick tutorial about this awesome lib](http://vitomd.com/blog/coding/hello-riot-js-quick-tutorial-about-this-awesome-lib/)

### Video Tutorials
- [Introduction](https://www.youtube.com/watch?v=al87U6NgRTc)
- [Loops, Events and Callbacks](https://www.youtube.com/watch?v=T-ZV9dv93sw)
- [Server Rendering with Node & Express](http://youtu.be/6ww1UXGJzcs)
- [Riot And Webpack Setup](https://youtu.be/UgdZbT-KPpY)
- [Riot and Redux - Part 1](https://youtu.be/Y6vpKAGT2-8)
- [Riot and Redux - Part 2](https://youtu.be/DgM03bvgCYc)
- [Riot and Redux - Part 3](https://youtu.be/QuwnbuneAzM)
- [Riot and Redux - Part 4](https://youtu.be/qc6bjtu7KG0)
- [Riot and Redux - Part 5](https://youtu.be/M4BNsRMatVY)
- [Riot and Redux - Part 6](https://youtu.be/jr8KDpwtRsk)


### Libraries / Frameworks
- [Flux- like event controller for Riot](https://github.com/jimsparkman/RiotControl)
- [riotux - Simple Event Controller for Riot.js](https://github.com/luisvinicius167/riotux)
- [flux-riot framework](https://github.com/mingliangfeng/flux-riot)
- [Cheftjs - chinese framework for Riot](https://github.com/cheft/cheftjs)
- [Veronica - flux adaption for Riot](https://www.npmjs.com/package/veronica-x)
- [Minimal Flux dispatcher pattern](https://gist.github.com/continuata/c605846751c09a5e94d12ae8c91cbf05)
- [riot-format: a format library for riotjs, like angular $filter](https://github.com/joylei/riot-format)

### Components
- [Material UI](http://kysonic.github.io/riot-mui/)
- [RiotGear Components](https://riotgear.js.org)
- [RiotGear Router](http://riotgear.js.org/components/router/)
- [Riot Bootstrap](http://cognitom.github.io/riot-bootstrap/)
- [iToolkit](https://github.com/BE-FE/iToolkit)
- [Riot Routehandler](https://github.com/crisward/riot-routehandler)-[(Demo)](http://codepen.io/crisward/pen/xwGJpM?editors=101)
- [Riot Flipcard](https://github.com/crisward/riot-flipcard) - [(Demo)](https://crisward.github.io/riot-flipcard/)
- [Riot Grid](https://github.com/crisward/riot-grid) - [(Demo)](http://codepen.io/crisward/pen/rxepMX?editors=101)
- [Riot Grid2](https://github.com/crisward/riot-grid2) - [(Demo)](http://crisward.github.io/riot-grid2/)
- [Riot Subtag](https://github.com/crisward/riot-subtag) - faster than lots of if's
- [ESLint Riot Plugin](https://github.com/txchen/eslint-plugin-riot)
- [riot-animate](https://github.com/sartaj/riot-animate)
- [Nest UI](https://github.com/fengzilong/Nest) - [(Demo)](https://fengzilong.github.io/Nest/)
- [rGrid](https://github.com/limodou/rgrid) - [(Demo)](https://limodou.github.io/rgrid/examples.html)

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
- [Riot loader plugin for RequireJS](https://github.com/amenadiel/requirejs-riot)
- [Riot loader plugin for JSPM/SystemJS](https://github.com/amenadiel/systemjs-riot)
- [RiotJS Style Guide](https://github.com/voorhoede/riotjs-style-guide)
- [Riot Cheatsheet](http://martinmuzatko.github.io/riot-cheatsheet/)

### Performance
- **Riot vs React performance:** [(Riot version)](https://github.com/kazzkiq/samples/tree/gh-pages/perf/dom-riot-vs-vanilla) vs [(React version)](https://github.com/kazzkiq/samples/tree/gh-pages/perf/dom-react-vs-vanilla)

### Miscellaneous
- [Q&A with RiotJS author Tero Piirainen](http://www.triplet.fi/blog/q-and-a-with-riotjs-author-tero-piirainen/)
- [riot-detector (Chrome Extension)](https://chrome.google.com/webstore/detail/riot-detector/cnnmjeggdmicjojlnjghdgkdlijiobke)

### Editors / Editor Plugins (Syntax highlighting, autcompletion, etc...)
- [riot (Atom Package)](https://atom.io/packages/riot)
- [language-riot-tag (Atom Package)](https://github.com/dekimasoon/language-riot-tag)
  - Based on Vue's official Sublime Text highlighter
  - Note: Designed for html, not jade.
- [sublime-tag (Sublime Text)](https://github.com/crisward/sublime-tag)
- [riot-tag (Visual Studio)](https://github.com/crisward/riot-tag)
- [web-mode (Emacs)](http://web-mode.org)
  - See how to configure [#1967](https://github.com/riot/riot/issues/1967)

### How to contribute

If you are reading this it's already a good sign and we are thankful for it! We try our best working as much as we could on riot but your help is always appreciated.

If you want to contribute to riot helping us maintaining the project please check first the list of [our open issues](https://github.com/riot/riot/issues) to understand whether there is a task where you could help.

Riot is mainly developed on UNIX systems so you will be able to run all the commands necessary to build and test the library using our [Makefile](Makefile). If you are on a Microsoft machine it could be harder to set up you development environment properly.

Following the steps below you should be able to properly submit your patch to the project

#### 1) Clone the repo and browse to the riot folder

```shell
$ git clone git@github.com:riot/riot.git && cd riot
```
#### 2) Set up your git branch

```shell
$ git checkout -b feature/my-awesome-patch
```

#### 3) Install the npm dependencies

```shell
$ npm i
```

#### 4) Build and test riot using the Makefile

```shell
# To build and test riot
$ make riot

# To build without testing
$ make raw

# To build anytime you change a src file
$ make watch

# To bench riot ( it requires ctrl+c to exit )
$ make perf
```

#### 5) Pull request only against the `dev` branch making sure you have read [our pull request template](.github/PULL_REQUEST_TEMPLATE.md)

#### 6) Be patient


### Credits

Riot is made with :heart: by many smart people from all over the world. Thanks to all the contributors<br>
It's actively maintained by:
<table>
  <tbody>
    <tr>
      <td align="center" valign="top">
        <img width="125" height="125" src="https://github.com/rsbondi.png?s=125">
        <br>
        <a href="https://github.com/rsbondi">Richard Bondi</a>
      </td>
      <td align="center" valign="top">
        <img width="125" height="125" src="https://github.com/GianlucaGuarini.png?s=125?s=125">
        <br>
        <a href="https://github.com/GianlucaGuarini">Gianluca Guarini</a>
      </td>
      <td align="center" width="20%" valign="top">
        <img width="125" height="125" src="https://github.com/cognitom.png?s=125">
        <br>
        <a href="https://github.com/cognitom">Tsutomu Kawamura</a>
      </td>
      <td align="center" valign="top">
        <img width="125" height="125" src="https://github.com/aMarCruz.png?s=125">
        <br>
        <a href="https://github.com/aMarCruz">Alberto Martínez</a>
      </td>
      <td align="center" valign="top">
        <img width="125" height="125" src="https://github.com/rogueg.png?s=125">
        <br>
        <a href="https://github.com/rogueg">Grant Marvin</a>
      </td>
      <td align="center" valign="top">
        <img width="125" height="125" src="https://github.com/tipiirai.png?s=125">
        <br>
        <a href="https://github.com/tipiirai">Tero Piirainen</a>
      </td>
     </tr>
  </tbody>
</table>

## Official Website

http://riotjs.com/

## Backers

Support us with a monthly donation and help us continue our activities. [Become a backer][support-url]

[![Backers][backers-image]][support-url]

## Sponsors

Become a sponsor to get your logo on our README. [Become a sponsor][support-url]

[![Sponsors][sponsors-image]][support-url]


[travis-image]:https://img.shields.io/travis/riot/riot.svg?style=flat-square
[travis-url]:https://travis-ci.org/riot/riot

[license-image]:http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square
[license-url]:LICENSE.txt

[npm-version-image]:http://img.shields.io/npm/v/riot.svg?style=flat-square
[npm-downloads-image]:http://img.shields.io/npm/dm/riot.svg?style=flat-square
[npm-url]:https://npmjs.org/package/riot

[riot-forum-image]:https://img.shields.io/badge/muut-JOIN_FORUM%E2%86%92-ff0044.svg?style=flat-square
[riot-forum-url]:http://riotjs.com/forum/

[coverage-image]:https://img.shields.io/coveralls/riot/riot/dev.svg?style=flat-square
[coverage-url]:https://coveralls.io/r/riot/riot?branch=dev

[saucelabs-image]:https://saucelabs.com/browser-matrix/testsriotjs.svg?1
[saucelabs-url]:https://saucelabs.com/u/testsriotjs

[gitter-image]:https://img.shields.io/badge/GITTER-JOIN_CHAT_%E2%86%92-1dce73.svg?style=flat-square
[gitter-url]:https://gitter.im/riot/riot?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge

[slack-ja-image]:https://img.shields.io/badge/SLACK_(ja)-JOIN_CHAT_%E2%86%92-551a8b.svg?style=flat-square
[slack-ja-url]:https://riot-jp-slackin.herokuapp.com/

[codeclimate-image]:https://img.shields.io/codeclimate/github/riot/riot.svg?style=flat-square
[codeclimate-url]:https://codeclimate.com/github/riot/riot

[donations-campaign-url]:https://pledgie.com/campaigns/31139
[donations-campaign-image]:https://pledgie.com/campaigns/31139.png?skin_name=chrome


[backer-url]: #backers
[backer-badge]: https://opencollective.com/riot/backers/badge.svg?color=blue
[sponsor-url]: #sponsors
[sponsor-badge]: https://opencollective.com/riot/sponsors/badge.svg?color=blue

[support-url]: https://opencollective.com/riot#support

[backers-image]: https://opencollective.com/riot/backers.svg
[sponsors-image]: https://opencollective.com/riot/sponsors.svg
