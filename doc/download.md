
title: Download Riot
subtitle: Download
description: none

====

#### Version {{ riot_version }} | .tall

## NPM

``` sh
npm install riot -g
```

### Compiler

Riot compiler transforms `.tag` files to `.js` for browsers. For example:

``` sh
riot --watch my/custom.tag
```

This detects changes on the .tag file and generates a .js files automatically. See [compiler guide](/riotjs/guide/#compiler) or run `riot --help` for more information.


## Git

<span class="tag">URL</span> https://github.com/muut/riotjs

Please clone the repository and run the demo locally.

``` sh
git clone git@github.com:muut/riotjs.git
cd riotjs
npm install
make riot
make watch
open demo/index.html
```

You can now edit `demo/todo.tag` file and the compiler automatically watch for changes and transforms it to .js file.


## Direct download

[riot.min.js](/riotjs/dist/riot-{{ riot_version }}.min.js) – For production. 5.7KB minified / 2.5KB gzipped

[riot.js](/riotjs/dist/riot-{{ riot_version }}.js) – For development

[demo.zip](/riotjs/dist/riot-{{ riot_version }}.zip) - Working demo with unminified version

[live demo](/riotjs/dist/demo/)


## IE8 support

IE8 requires that both [es5-shim](https://github.com/es-shims/es5-shim) and [html5-shiv](https://github.com/aFarkas/html5shiv) are included on the `<head>` of your page and IE is configured to work with the latest rendering engine. Here's how you do it:

``` html
<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">

  <!--[if lt IE 9]>
    <script src="es5-shim.js"></script>
    <script src="html5-shiv.js"></script>
    &lt;script>html5.addElements('test')</script>
  <![endif]-->
</head>
```

You must tell IE8 what custom tags are being used on the page with `html5.addElements`. For example

``` html
&lt;script>html5.addElements('todo todo-item account plan')</script>
```

That's a space separated list of tag names.

See a [live demo](/riotjs/dist/demo/) or download the [demo.zip](/riotjs/dist/riot-{{ riot_version }}.zip).


## Known issues

On current version conditionals are implemented with `style="display: none"`. This will be fixed on upcoming version where `if` attribute will add/remove the element from the DOM completely.


## Media

![](logo/riot60x.png | .no-retina )
![](logo/riot120x.png | .no-retina )
![](logo/riot240x.png | .no-retina )
![](logo/riot480x.png | .no-retina )
![](logo/riot960x.png | .no-retina )
