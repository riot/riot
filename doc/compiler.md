
title: Riot compiler
subtitle: Compiler
description: From &lt;custom-tag> to JavaScript

====

## Installation

Custom tags need to be transformed to JavaScript before the browser can execute them. You need a `riot` executable for the job. Install it with NPM as follows:

``` sh
npm install riot -g
```

Type `riot --help` and make sure it works. [node.js](http://nodejs.org/) is required on your machine.


### Using

Here is how you compile...

``` sh
# a file to current folder
riot some.tag

# file to target folder
riot some.tag some_folder

# file to target path
riot some.tag some_folder/some.js

# all files from source folder to target folder
riot some/folder path/to/dist

# all files from source folder to a single concatenated file
riot some/folder all-my-tags.js

```


The source file can contain one or more custom tags and there can be regular JavaScript mixed together with custom tags. The compiler will only transform the custom tags and does not touch other parts of the source file.

For more information, type: `riot --help`


### Watch mode

You can watch directories and automatically transform files when they are changed.

``` sh
# watch for
riot -w src dist
```


### Node module


```
var compiler = require('riot/compiler')

var js = compiler.compile(source_string)
```

The compile function takes a string and returns a string.

### Plug into your workflow

- [Gulp](https://github.com/e-jigsaw/gulp-riot)
- [Grunt](https://github.com/ariesjia/grunt-riot)
- [Browserify](https://github.com/jhthorsen/riotify)


## Pre-processors

### CoffeeScript

The source language is specified with `--type` or `-t` argument:

``` sh
# use coffeescript pre-processor
riot --type coffeescript --expr source.tag
```

The `--expr` argument specifies that all the expressions are also processed as well. You can also use "cs" as an alias to "coffeescript". Here is a sample tag written in CoffeeScript:

```
<kids>

  <h3 each={ kids[1 .. 2] }>{ name }</h3>

  # Here are the kids
  this.kids = [
    { name: "Max" }
    { name: "Ida" }
    { name: "Joe" }
  ]

</kids>
```

Note that `each` attribute is CoffeeScript as well. CoffeeScript must be present on your machine:

``` sh
npm install coffee-script -g
```


### EcmaScript 6

ECMAScript 6 is enabled with a type "es6":

``` sh
# use ES6 pre-processor
riot --type es6 source.tag
```

An sample tag written in ES6:

```
<test>

  <h3>{ test }</h3>

  var type = 'JavaScript'
  this.test = `This is ${type}`

</test>
```

All ECMAScript 6 [features](https://github.com/lukehoban/es6features) can be used. [6to5](https://6to5.org/) is used for the transformation:

``` sh
npm install 6to5
```


### Your favorite language

You can configure your favourite language by making a custom parser function. For example:

``` js
function myParser(js, options) {
  return doYourThing(js, options)
}
```

This parser is then passed for the compiler with `parser` option:

``` js
var compiler = require('riot/compiler')

var js = compiler.compile(source_string, { parser: myParser, expr: true })
```

Set `expr: true` if you want the expressions to be parsed as well.


### No transformation

By default Riot uses a build-in transpiler that simply enables shorter ES6- stylish method signatures. You can disable all transformation with `--type none`:

``` sh
# no pre-processor
riot --type none --expr source.tag
```


## Creating tags manually

You can create cusom tags without the compiler using `riot.tag`. For example:

``` js
riot.tag('timer', '<p>Seconds Elapsed: { time }</p>', function (opts) {
  this.time = opts.start || 0

  this.tick = (function () {
    this.update({
        time: ++this.time
    })
  }).bind(this)

  var timer = setInterval(this.tick, 1000)

  this.on('unmount', function () {
    clearInterval(timer)
  })

})
```

See [timer demo](http://jsfiddle.net/gnumanth/h9kuozp5/) and [riot.tag](/riotjs/api/#tag) API docs for more details and *limitations*.
