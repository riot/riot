
title: Download Riot
subtitle: Get Riot
description: none

====

#### Version *{{ riot_version }}*  • *[Release notes](release-notes.html)* | .tall


Three steps and you'll be rocking with Riot in no time:
1. [Install riot compiler](#install-riot-compiler) for translating your `.tag` files to `.js`
2. [Grab riot.js library](#grab-riotjs) for gluing your app together
3. [Make awesome things](#make-something-awesome) and have fun

So let's get going, shall we?


## 1. Install riot compiler

``` sh
npm install riot -g
```

Makes no sense? Get [node.js](http://nodejs.org/) first.

## 2. Grab riot.js

More ways to get Riot than we can count, just choose one:

- Download (the old way):
  
  [riot.min.js](/riotjs/dist/riot-{{ riot_version }}.min.js) – for production ( 5.7KB minified / 2.5KB gzipped )

  [riot.js](/riotjs/dist/riot-{{ riot_version }}.js) – for development

- Load from CDN (the lazy way):

  [cdnjs](https://cdnjs.com/libraries/riot): `https://cdnjs.cloudflare.com/ajax/libs/riot/{{ riot_version }}/riot.min.js`

  [jsDelivr](http://www.jsdelivr.com/#!riot): `https://cdn.jsdelivr.net/riot/{{ riot_version }}/riot.min.js`

- Install using package manager (the hipster way):

  [Bower](http://bower.io/search/?q=riot.js): `bower install riot`
  
  [Component](http://component.github.io/?q=riot): `component install muut/riotjs`
  
  [NPM](https://www.npmjs.com/package/riot): `npm install riot`

- Clone the repo (the nerd way):
  
  [GitHub](https://github.com/muut/riotjs): `git clone git@github.com:muut/riotjs.git`


## 3. Make something awesome

The basic steps to create Riot app are:

1. Compile your `.tag`s to `.js`:
``` sh
riot --watch tags/ tags.js
```

2. Include [riot.js](#grab-riotjs) with your compiled tags:
``` html
<script src="riot.js"></script>
<script src="tags.js"></script>
```

3. Mount tags on the page:
``` html
<todo></todo>
<script>riot.mount('todo')</script>
```

That's it! See [docs](http://devsite.muut.com/riotjs/guide/) for more. Or... 

### Play with a demo

1. See it [live](/riotjs/dist/demo/)

2. Grab the [sources](/riotjs/dist/riot-{{ riot_version }}.zip) (or find in our repo)

3. Hack around: `riot --watch`, break things, fix things, refresh, repeat

### Make cool things...

...and don't forget to show them to us!


## IE8 support

Riot works all the way back to IE8.

Just give it [es5-shim](https://github.com/es-shims/es5-shim) & [html5-shiv](https://github.com/aFarkas/html5shiv) and tell it to use the latest rendering engine:

``` html
<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--[if lt IE 9]>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.0.5/es5-shim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script>html5.addElements('test')</script>
  <![endif]-->
</head>
```

...and let it know about your custom tags before using them on a page:

``` html
<script>html5.addElements('todo todo-item account plan')</script>
```

You can see how it works in [a demo](play-with-a-demo).


## Known issues

On current version conditionals are implemented with `style="display: none"`. This will be fixed on upcoming version where `if` attribute will add/remove the element from the DOM completely.


## Media

![](logo/riot60x.png | .no-retina )
![](logo/riot120x.png | .no-retina )
![](logo/riot240x.png | .no-retina )
![](logo/riot480x.png | .no-retina )
![](logo/riot960x.png | .no-retina )
