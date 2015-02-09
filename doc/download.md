
title: Download Riot
subtitle: Get Riot
description: none
minify: false

base: https://raw.githubusercontent.com/muut/riotjs/master
cdnjs: https://cdnjs.cloudflare.com/ajax/libs/riot
version: 2.0

====

##### [<span class="tag">v{{ riot_version }}</span> release notes](release-notes.html) | .tall


### Direct download

[riot.compiler.min.js]({{ base }}/riot.compiler.min.js)

[riot.compiler.js]({{ base }}/riot.compiler.js)

[riot.min.js]({{ base }}/riot.min.js)

[riot.js]({{ base }}/riot.js)


### Content delivery networks


#### [jsdelivr](http://www.jsdelivr.com/#!riot)

`https://cdn.jsdelivr.net/g/riot@2.0(riot.min.js+compiler.min.js)` <small>(latest 2.0.X)</small>

`https://cdn.jsdelivr.net/riot/2.0/riot.min.js` <small>(latest 2.0.X)</small>

`https://cdn.jsdelivr.net/g/riot@{{ riot_version }}(riot.min.js+compiler.min.js)`

`https://cdn.jsdelivr.net/riot/{{ riot_version }}/riot.min.js`


#### [cdnjs](https://cdnjs.com/libraries/riot)

`{{ cdnjs }}/{{ riot_version }}/riot+compiler.min.js`

`{{ cdnjs }}/{{ riot_version }}/riot.min.js`




### Package managers

#### [Bower](http://bower.io/search/?q=riot.js)

`bower install riot`

#### [Component](http://component.github.io/?q=riot)

`component install muut/riotjs`

#### [NPM](https://www.npmjs.com/package/riot)

`npm install riot`


### GitHub

#### [muut/riotjs](https://github.com/muut/riotjs)

`git clone git@github.com:muut/riotjs.git`



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

Also let it know about all your custom tags before using them on a page:

``` html
&lt;script>html5.addElements('my-tag my-another-tag')</script>
```

That's a space separated list of tag names.


## Known issues

- `each` attribute does not detect if the looped items are sorted or otherwise re-ordered
- Looping table rows or cells with `each` attribute is not working on IE8 and IE9.
- `if / show / hide` attributes cannot be set on a root node of a custom tag


## Media

![](logo/riot60x.png | .no-retina )
![](logo/riot120x.png | .no-retina )
![](logo/riot240x.png | .no-retina )
![](logo/riot480x.png | .no-retina )
![](logo/riot960x.png | .no-retina )
