
title: Riot release notes
subtitle: Release notes
description: A shortened version history
body_id: riot-releases

====


### 2.0.8 *Feb --, 2015*

- Global variables in expressions, e.g. `{ location }`
- Customizable `{` brackets `}`, e.g. `[ ]`, `<% %>`
- Customizable `.tag` extension, e.g. `.html`


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
