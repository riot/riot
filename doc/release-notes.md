
title: Riot release notes
subtitle: Release notes
description: A shortened version history
body_id: riot-releases

====

### 2.2.0 *June 27, 2015*

- New super fast loop logic ( the DOM nodes will be no longer reordered [more details here](https://github.com/riot/riot/issues/484) )
- Re-enable the `use strict` mode
- Re-enable the `coffescript` mode for the nostalgics
- Fix inconsistencies using loop with empty or null arrays
- Fix the `mount` in the loop children
- Increase the code coverage
- Add the possibility to specify where riot will inject the custom tags [css in the DOM](/riotjs/guide/#scoped-css)

List of bug fixes and details can be found [here](https://github.com/riot/riot/issues/773)

### 2.2.0 *May 20, 2015*

- [Mixins](/riotjs/guide/#mixins)
- Ability to define attributes for the root element on the tag definition
- Split the node compiler from the browser compiler
- Simplify the build script using [smash](https://github.com/mbostock/smash)
- Add Saucelabs tests hooks for crossbrowser testing
- Add Coveralls coverage hooks to check the code coverage on any pull request

List of bug fixes and details can be found [here](https://github.com/riot/riot/issues/648)

### 2.0.15 *Apr 23, 2015*

- A new `<yield>` core tag allowing [html transclusion](/riotjs/guide/#nested-html)
- A new [riot-tag](/riotjs/guide/#riot-tag) attribute to use standard HTML elements as mount nodes
- `tag.unmount(flag)` to decide whether the parent should be removed or not from the DOM
- `riot.route.start()` and `riot.route.stop()` methods to start and stop the Riot router. These methods allow the use of a different router on your appliaction.
- The server side compiiler now supports AMD and CommonJS modules with `--modular` or `-m` command line option
- Numerous [bug fixes](https://github.com/riot/riot/issues/584)
- Special thanks to *[@GianlucaGuarini](https://github.com/GianlucaGuarini)* for this release


### 2.0.14 *Apr 8, 2015*

- [Server side rendering](/riotjs/guide/#server-side)
- [Bug fixes](https://github.com/riot/riot/compare/v2.0.13...v2.0.14)

### 2.0.13 *Mar 11, 2015*

- A large bug fix release consisting of [pull requests](https://github.com/riot/riot/compare/v2.0.12...v2.0.13) from the community only. Thank you!
- Larger [test suite](https://github.com/riot/riot/tree/master/test)

### 2.0.12 *Mar 2, 2015*

- Support for [Scoped CSS](/riotjs/guide/#scoped-css)
- Direct [access to nested tags](/riotjs/api/#nested-tags) and their API via `tags` variable. For example: `tags.my_timer.clear()`
- The custom tags are now constructed on parse time and initialized on mount time. This is preliminary work for the upcoming [plugin system](https://github.com/riot/riot/issues/416) and allows plugins to do their thing before initialization as well.
- `--whitespace` compiler option to preserve newlines and whitespace on the generated output. Good with nested `pre` and `textarea` elements.
- Using [Karma](http://karma-runner.github.io/0.12/index.html) for cross browser testing
- *WARNING* the deprecated `riot.mountTo` will be removed on the next release


### 2.0.11 *Feb 23, 2015*

- `riot.mount` now accepts the same parameters as `riot.mountTo`, which is now *deprecated*
- New `riot.mount(selector, tagName, opts)` allows you to mount a certain tag to any selection of HTML elements
- `riot.unmount` followed with `riot.mount` now correcly replaces the earlier tag
- Test suite v1. Expect this to grow in size and functionality. Thanks to [@GianlucaGuarini](https://github.com/GianlucaGuarini)


### 2.0.10 *Feb 19, 2015*

- [Todo MVC example](https://github.com/txchen/feplay/tree/gh-pages/riot_todo)
- Array items can be sorted and reordered and the view updates accordingly. Thanks to [@pakastin](https://github.com/pakastin)!
- Nested `style` tags are automatically inject into `<head>` to avoid duplicate definitions
- Ability to define tags on the same line: `<tag></tag>`
- Single line ES6 style methods: `foo() { this.bar = 'baz' }`
- No illegal server requests with images: `<img src={ src }>`
- Fix compiler to support custom brackets
- `this.update()` is no longer needed when defining tags manually with `riot.tag`. This method is now automatically called after an event handler is executed
- [Contributing guidelines](https://github.com/riot/riot
`script`/blob/master/CONTRIBUTING.md)


### 2.0.9 *Feb 13, 2015*

- LiveScript support
- Ability to set `if`, `show` and `hide` attributes for a custom tag
- Multiple class shortcut: `{ 'foo bar': baz }`
- Took away `children` property, which was designed for theoretical need mostly.
- A memory leak fix on `riot.observable`. Thanks to [@GianlucaGuarini](https://github.com/GianlucaGuarini) for the hard debug work and everyone else on this [pull request](https://github.com/riot/riot
`script`/issues/248)


### 2.0.8 *Feb 9, 2015*

- New `unmount()` method and `children[]` property for [tag instances](/riotjs/api/#tag-instance)
- One way data flow: updates and unmounts always propagate downwards from parent to children
- The `if` attribute now works as expected by adding or removing the root node from DOM
- [Compiler API](/riotjs/api/#compiler) exposed to the public
- Global variables are supported in expressions, e.g. `{ location }`
- Customizable `.tag` extension, e.g. `riot --ext html`
- [Customizable brackets](/riotjs/api/#brackets), e.g. `riot.settings.brackets = '${ }'`
- Ability to print the current version with: `riot --version`
- The semi-hidden `riot._tmpl()` is now completely hidden and not part of the global `riot` object
- Reorganized source code. The former big `view.js` is now split into [multiple files](https://github.com/riot/riot
`script`/tree/master/lib/tag)


### 2.0.7 *Jan 29, 2015*

- Super fast [in-browser compilation](compile.html) for: `<script type="riot/tag">`
- Built-in [Typescript support](compiler.html#typescript)
- Ability to plug in a HTML pre-processor (along with JS processor)
- Built-in [Jade support](compiler.html#jade)
- Ability to define [custom parsers](api/#route-parser) for router.
- Markup can be written with valid XML and HTML5 void tags are not self-closed
- Allow definition of empty placeholder tags. Good on development phase.
- `riot.observable()` now returns a new observable when called without the argument
- Compiler is now called like this:


```
var riot = require('riot')
var js_string = riot.compile(tag_source_string)
```


### 2.0.5 *Jan 27, 2015*

- An ability to plug in a JavaScript pre-processor
- Built-in CoffeeScript support
- Built-in EcmaScript 6 support


### 2.0.2 *Jan 26, 2015*

- CommonJS and AMD support
- Component support
- Bower support
- `npm install` now works under io.js and node 0.11
- `require('riot')` now returns riot.js (plays nicely with Browserify etc.)
- `require('riot/compiler')` returns the compiler
- `riot.js` and `riot.min.js` are now found on the repository root
- hosted on [cdnjs](https://cdnjs.com/libraries/riot) and [jsdelivr](http://www.jsdelivr.com/#!riot)


### 2.0 *Jan 22, 2015*

[A React- like, 2.5KB user interface library](/blog/technology/riot-2.0/)

A significant non- backwards compatible update.

![](/blog/technology/riot-2.0/riot1to2.png | .no-retina 500)


### 1.0 *April 15, 2014*

Removal of jQuery dependency.


### 0.9 *November 01, 2013*

[The 1kb client-side MVP library](/blog/technology/riotjs-the-1kb-mvp-framework.html)

The initial release.
