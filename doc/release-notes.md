
title: Riot release notes
subtitle: Release notes
description: A shortened version history
body_id: riot-releases

====

### 2.0.9 *Feb __, 2015*

- LiveScript support
- Multiple class shortcut: { 'foo bar': baz }
- Took away `children` property, which was designed for theoretical need mostly.


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
- Reorganized source code. The former big `view.js` is now split into [multiple files](https://github.com/muut/riotjs/tree/master/lib/tag)


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
