
[![Riot logo](https://riot.js.org/img/logo/riot-logo.svg)](https://riot.js.org)

## Simple and elegant component-based UI library

[![Build Status][travis-image]][travis-url]
[![MIT License][license-image]][license-url]
[![Join the chat at https://gitter.im/riot/riot][gitter-image]][gitter-url]
[![Join the chat (ja) at https://riot-jp-slackin.herokuapp.com/][slack-ja-image]][slack-ja-url]
[![OpenCollective Backers][backer-badge]][backer-url] [![OpenCollective Sponsors][sponsor-badge]][sponsor-url]

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![jsDelivr Hits][jsdelivr-image]][jsdelivr-url]
[![Coverage Status][coverage-image]][coverage-url]
![Riot Size][lib-size]
[![Code Quality][codeclimate-image]][codeclimate-url]

[![Sauce Test Status][saucelabs-image]][saucelabs-url]


### Custom components • Concise syntax • Simple API • Tiny Size

Riot brings custom components to all modern browsers. It is designed to offer you everything you wished native the web components API looked like.

#### Tag definition

```html
<timer>
  <p>Seconds Elapsed: { state.time }</p>

  <script>
    export default {
      tick() {
        this.update({ time: ++this.state.time })
      },
      onBeforeMount(props) {
        // create the component initial state
        this.state = {
          time: props.start
        }

        this.timer = setInterval(this.tick, 1000)
      },
      onUnmounted() {
        clearInterval(this.timer)
      }
    }
  </script>
</timer>
```

[Open this example on Plunker](http://riot.js.org/examples/plunker/?app=timer)

#### Mounting

```javascript
// mount the timer with its initial props
riot.mount('timer', { start: 0 })
```

#### Nesting

Custom components let you build complex views with HTML.

```html
<timetable>
  <timer start="0"></timer>
  <timer start="10"></timer>
  <timer start="20"></timer>
</timetable>
```

HTML syntax is the de facto language on the web and it's designed for building user interfaces. The syntax is explicit, nesting is inherent to the language and attributes offer a clean way to provide options for custom tags.


### Performant and predictable
- Absolutely the smallest possible amount of DOM updates and reflows.
- Fast expressions bindings instead of virtual DOM memory performance issues and drawbacks.
- One way data flow: updates and unmounts are propagated downwards from parent to children.
- No "magic" or "smart" reactive properties or hooks
- Expressions are pre-compiled and cached for high performance.
- Lifecycle methods for more control.


### Close to standards
- No proprietary event system.
- Future proof thanks to the javascript module syntax.
- The rendered DOM can be freely manipulated with other tools.
- No extra HTML root elements, `data-` attributes or fancy custom attributes.
- No new syntax to learn.
- Plays well with any frontend framework.


### Use your dearest language and tools
- Create components with CoffeeScript, Jade, LiveScript, Typescript, ES6 or [any pre-processor](https://riot.js.org/next/#pre-processors) you want.
- Build with [@riotjs/cli](https://github.com/riot/cli), [webpack](https://github.com/riot/webpack-loader), [Rollup](https://github.com/riot/rollup-plugin-riot), [parcel](https://github.com/riot/parcel-plugin-riot), [Browserify](https://github.com/riot/riotify).
- Test with however you like, you can [load your riot tags directly in node](https://github.com/riot/ssr#render---to-render-only-markup)


### Powerful and modular ecosystem

The Riot.js ecosystem is completely modular, it's designed to let you pick only the stuff you really need:

  - [@riotjs/cli](https://github.com/riot/cli) - CLI to compile locally your tags to javascript
  - [@riotjs/ssr](https://github.com/riot/ssr) - Super simple server side rendering
  - [@riotjs/hydrate](https://github.com/riot/hydrate) - Hydration strategy for your SPA
  - [@riotjs/hot-reload](https://github.com/riot/hot-reload) - Live reload plugin
  - [@riotjs/compiler](https://github.com/riot/compiler) - Advanced tags compiler
  - [@riotjs/parser](https://github.com/riot/parser) - HTML parser
  - [@riotjs/dom-bindings](https://github.com/riot/dom-bindings) - Expressions based template engine
  - [@riotjs/now](https://github.com/riot/now) - https://zeit.co/ now integration
  - [@riotjs/custom-elements](https://github.com/riot/custom-elements) - native custom elements implementation

### CDN hosting
- [unpkg](https://unpkg.com/riot/riot.js)
- [jsDelivr](https://www.jsdelivr.com/projects/riot)
- [cdnjs](https://cdnjs.com/libraries/riot)

### How to contribute

If you are reading this it's already a good sign and I am thankful for it! I try my best working as much as I can on riot but your help is always appreciated.

If you want to contribute to riot helping the project maintenance please check first the list of [open issues](https://github.com/riot/riot/issues) to understand whether there is a task where you could help.

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
```

#### 5) Pull request only against the `dev` branch making sure you have read [our pull request template](.github/PULL_REQUEST_TEMPLATE.md)

#### 6) Be patient


### Credits

Riot is actively maintained with :heart: by:

<table>
  <tbody>
    <tr>
      <td valign="top">
        <img width="125" height="125" src="https://github.com/GianlucaGuarini.png?s=125?s=125">
        <br>
        <a href="https://github.com/GianlucaGuarini">Gianluca Guarini</a>
      </td>
     </tr>
  </tbody>
</table>

Many thanks to all smart people from all over the world who helped improving it.

## Official Website

http://riot.js.org

## Backers

Support us with a monthly donation and help us continue our activities. [Become a backer][support-url]

[![Backers][backers-image]][support-url]

## Sponsors

Become a sponsor to get your logo on our README. [Become a sponsor][support-url]

[![Sponsors][sponsors-image]][support-url]

## Thanks

Special thanks to Browserstack for their support

<a href='https://www.browserstack.com/'>
  <img width='70px' src="https://cdn.worldvectorlogo.com/logos/browserstack.svg" alt="browser stack">
</a>

[travis-image]:https://img.shields.io/travis/riot/riot.svg?style=flat-square
[travis-url]:https://travis-ci.org/riot/riot

[license-image]:http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square
[license-url]:LICENSE.txt

[npm-version-image]:http://img.shields.io/npm/v/riot.svg?style=flat-square
[npm-downloads-image]:http://img.shields.io/npm/dm/riot.svg?style=flat-square
[npm-url]:https://npmjs.org/package/riot

[coverage-image]:https://img.shields.io/coveralls/riot/riot/dev.svg?style=flat-square
[coverage-url]:https://coveralls.io/r/riot/riot?branch=dev

[saucelabs-image]:https://saucelabs.com/browser-matrix/testsriotjs.svg?1
[saucelabs-url]:https://saucelabs.com/u/testsriotjs

[gitter-image]:https://img.shields.io/badge/GITTER-JOIN_CHAT_%E2%86%92-1dce73.svg?style=flat-square
[gitter-url]:https://gitter.im/riot/riot?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge

[slack-ja-image]:https://img.shields.io/badge/SLACK_(ja)-JOIN_CHAT_%E2%86%92-551a8b.svg?style=flat-square
[slack-ja-url]:https://riot-jp-slackin.herokuapp.com/

[codeclimate-image]:https://api.codeclimate.com/v1/badges/b81ddf3c77e8189876da/maintainability
[codeclimate-url]:https://codeclimate.com/github/riot/riot

[donations-campaign-url]:https://pledgie.com/campaigns/31139
[donations-campaign-image]:https://pledgie.com/campaigns/31139.png?skin_name=chrome

[jsdelivr-image]: https://data.jsdelivr.com/v1/package/npm/riot/badge
[jsdelivr-url]: https://www.jsdelivr.com/package/npm/riot


[backer-url]: #backers
[backer-badge]: https://opencollective.com/riot/backers/badge.svg?color=blue
[sponsor-url]: #sponsors
[sponsor-badge]: https://opencollective.com/riot/sponsors/badge.svg?color=blue

[support-url]: https://opencollective.com/riot#support

[lib-size]: http://img.badgesize.io/https://unpkg.com/riot/riot.min.js?compression=gzip

[backers-image]: https://opencollective.com/riot/backers.svg
[sponsors-image]: https://opencollective.com/riot/sponsors.svg
