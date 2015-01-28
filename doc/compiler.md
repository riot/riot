
title: Riot compiler
subtitle: Compiler
description: From &lt;custom-tag> to JavaScript

====

## In-browser compilation

Custom tags need to be transformed to JavaScript before the browser can execute them. You can do this by setting a `type="riot/tag"` attribute for your script tags. The compilation happens as follows:


``` html
<!-- mount point -->
<my-tag></my-tag>

<!-- inlined tag definition -->
&lt;script type="riot/tag">
  <my-tag>
    <h3>Tag layout</h3>
    <inner-tag />
  </my-tag>
</script>

<!-- <inner-tag/> is specified on external file -->
<script src="path/to/javascript/with-tags.js" type="riot/tag"></script>

<!-- include riot.js and the compiler -->
<script src="//cdn.jsdelivr.net/riot/{{ riot_version }}/riot.min.js"></script>
<script src="//cdn.jsdelivr.net/riot/{{ riot_version }}/riot.compiler.min.js"></script>

<!-- compile and run -->
&lt;script>
riot.compile(function() {
  riot.mount('*')
})
</script>
```

The script tag and the external file can contain multiple tags combined with regular javascript.

The compilation is very cheap and takes no time at all. Compiling a [timer tag](https://github.com/muut/riotjs/blob/master/test/tag/timer.tag) 30 times takes 2 milliseconds on a regular laptop. If you have a crazy page with 1000 different timer-sized tags, the compilation takes 35ms.

The compiler weights only 3.2KB (1.7K gzipped) so you can safely perform client side compilation on production without download or performance or issues.

Just like Riot itself the compiler works on IE8 as well.


### riot.compile( ) method

Riot compile method works as follows:

``` javascript
riot.compile(function() {
  // done
})
```

It takes inlined tags and loads external tags and compiles them so they can be run on the browser. You can have multiple `riot.compile` methods on the page and they are all executed when all the tags are compiled.

You can call the method even after the execution in which case the function is executed immediately.

You can also compile tags directly as follows:

``` js
var javascript = riot.compile(tag_source)
```

`tag_source` can be a single tag or multiple tags with regular javascript combined. After the call the compiled tags are usable on the browser.


## Pre-compilation

Tags can be pre-compiled on the server side with `riot` executable. Install it with NPM as follows:

``` sh
npm install riot -g
```

Type `riot --help` and make sure it works. [node.js](http://nodejs.org/) is required on your machine.


### Using

Here is how it works:

``` sh
# compile a file to current folder
riot some.tag

# compile file to target folder
riot some.tag some_folder

# compile file to target path
riot some.tag some_folder/some.js

# compile all files from source folder to target folder
riot some/folder path/to/dist

# compile all files from source folder to a single concatenated file
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
var compiler = require('riot/compiler/compiler')
// NOTE: the above path will be shortened to "riot/compiler"

var js = compiler.compile(source_string)
```

The compile function takes a string and returns a string.

### Plug into your workflow

- [Gulp](https://github.com/e-jigsaw/gulp-riot)
- [Grunt](https://github.com/ariesjia/grunt-riot)
- [Browserify](https://github.com/jhthorsen/riotify)


## Pre-processors

This is the main fruit of pre- compilation. You can use your favourite pre- processor to create custom tags.


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

### TypeScript

TypeScript adds type to JavaScript:

``` sh
# use TypeScript pre-processor
riot --type typescript source.tag
```

An sample tag written in TypeScript:

```
<test>

  <h3>{ test }</h3>

  var test: string = 'JavaScript';
  this.test = test;

</test>
```

[typescript-simple](https://github.com/teppeis/typescript-simple) is used for the transformation:

``` sh
npm install typescript-simple
```

### Any language

You can configure your favourite language by making a custom parser function. For example:

``` js
function myParser(js, options) {
  return doYourThing(js, options)
}
```

This parser is then passed for the compiler with `parser` option:

``` js
var compiler = require('riot/compiler/compiler')

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
