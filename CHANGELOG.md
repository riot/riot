# Changelog

## 2.0.16

### Bugs fixed

  - [#608](/../../issues/608)
  - [#604](/../../issues/604)
  - [#534](/../../issues/534)
  - [#581](/../../issues/581) [#448](/../../issues/448)
  - [#514](/../../issues/514)
  - [#334](/../../issues/334)
  - [#724](/../../issues/724)
  - [#720](/../../issues/720)
  - [#699](/../../issues/699)

### Features

  - set the parent attributes also in the tag template [#289](/../../issues/289)
  - split the node compiler from the browser compiler
  - simplify the build script using probably [smash](https://github.com/mbostock/smash) to compile riot
  - include the components mixins in the core [#536](/../../issues/536)
  - add saucelabs tests hooks for crossbrowser testing
  - add coveralls coverage hooks to check the code coverage on any pull request
  - add the riot.parsers property [css, js, html]

## 2.0.15

### Bugs fixed
  - [#471](/../../issues/471)
  - [#576](/../../issues/576)
  - [#574](/../../issues/574)
  - [#557](/../../issues/557)
  - [#583](/../../issues/583)
  - [#518](/../../issues/518)
  - [#445](/../../issues/445)
  - [#586](/../../issues/586)
  - [#300](/../../issues/300) [#524](/../../issues/524)
  - [#518](/../../issues/518) riot.mount() will always return an array
  - [#295](/../../issues/295) [#304](/../../issues/304)

### features
  - add the `<yield/>` core tag allowing html tansclusion to [#300](/../../issues/300) [#524](/../../issues/524) (fixed with https://github.com/muut/riotjs/pull/617 pull request pending) [ __documentation to update!__ ]
  - introduced the new `riot-tag` attribute that could be used on any DOM element
  - `tag.unmount(flag)` to decide whether the parent should be removed or not from the DOM
  - added new `riot.route.start()` `riot.route.stop()` methods