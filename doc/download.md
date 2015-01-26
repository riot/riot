
title: Download Riot
subtitle: Get Riot
description: none
minify: false

====

#### Version *{{ riot_version }}*  • *[Release notes](release-notes.html)* | .tall


## The steps

1. [Install Riot compiler](#riot-compiler) for translating `.tag` files to `.js`
2. [Get riot.js](#riotjs)
3. [Develop](#develop)


## 1. Install Riot compiler | #riot-compiler

``` sh
npm install riot -g
```

After the installation type `riot --help` to make sure it works. [node.js](http://nodejs.org/) is required on your machine.


## 2. Get riot.js | #riotjs

Choose the preferred way:


####  Direct download

[riot.min.js](https://raw.githubusercontent.com/muut/riotjs/master/riot.min.js) – for production ( 5.7KB minified / 2.5KB gzipped )

[riot.js](https://raw.githubusercontent.com/muut/riotjs/master/riot.js) – for development


#### CDN

[cdnjs](https://cdnjs.com/libraries/riot): `https://cdnjs.cloudflare.com/ajax/libs/riot/{{ riot_version }}/riot.min.js`

[jsDelivr](http://www.jsdelivr.com/#!riot): `https://cdn.jsdelivr.net/riot/{{ riot_version }}/riot.min.js`


#### Package manager

[Bower](http://bower.io/search/?q=riot.js): `bower install riot`

[Component](http://component.github.io/?q=riot): `component install muut/riotjs`

[NPM](https://www.npmjs.com/package/riot): `npm install riot`


#### GitHub

[muut/riotjs](https://github.com/muut/riotjs): `git clone git@github.com:muut/riotjs.git`


## 3. Develop | #develop

Compile custom tags to JavaScript:

``` sh
riot --watch test.tag
```

Include `riot.js` and your compiled tags

```
<script src="riot.js"></script>
<script src="test.js"></script>
```

Mount tags on the page:

``` html
<todo></todo>

&lt;script>riot.mount('todo')</script>
```

See [docs](/riotjs/guide/) for more info. Please also check [live demo](http://muut.github.io/riotjs/demo/), browse the [sources](https://github.com/muut/riotjs/tree/gh-pages/demo), or download the [zip](https://github.com/muut/riotjs/archive/gh-pages.zip)

If you make something great, please [share it](https://github.com/muut/riotjs/issues/58) !


## IE8 support

For IE8 support you need to include [es5-shim](https://github.com/es-shims/es5-shim) and [html5-shiv](https://github.com/aFarkas/html5shiv) and tell it to use the latest rendering engine:

``` html
<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--[if lt IE 9]>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.0.5/es5-shim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.2/html5shiv.min.js"></script>
    &lt;script>html5.addElements('test')</script>
  <![endif]-->
</head>
```

...and let it know about your custom tags before using them on a page:

``` html
&lt;script>html5.addElements('todo todo-item account plan')</script>
```


## Known issues

On current version conditionals are implemented with `style="display: none"`. This will be fixed on upcoming version where `if` attribute will add/remove the element from the DOM completely.


## Media

![](logo/riot60x.png | .no-retina )
![](logo/riot120x.png | .no-retina )
![](logo/riot240x.png | .no-retina )
![](logo/riot480x.png | .no-retina )
![](logo/riot960x.png | .no-retina )
