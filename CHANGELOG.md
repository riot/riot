# Changelog

## 2.0.16

### Bugs fixed

  - #608
  - #604
  - #534
  - #581 #448
  - #514
  - #334
  - #724
  - #720
  - #699

### Features

  - set the parent attributes also in the tag template #289
  - split the node compiler from the browser compiler
  - simplify the build script using probably [smash](https://github.com/mbostock/smash) to compile riot
  - include the components mixins in the core #536
  - add saucelabs tests hooks for crossbrowser testing
  - add coveralls coverage hooks to check the code coverage on any pull request

## 2.0.15

### Bugs fixed
  - #471
  - #576
  - #574
  - #557
  - #583
  - #518
  - #445
  - #586
  - #300 #524
  - #518 riot.mount() will always return an array
  - #295 #304

### features
  - add the `<yield/>` core tag allowing html tansclusion to #300 #524 (fixed with https://github.com/muut/riotjs/pull/617 pull request pending) [ __documentation to update!__ ]
  - introduced the new `riot-tag` attribute that could be used on any DOM element
  - `tag.unmount(flag)` to decide whether the parent should be removed or not from the DOM
  - added new `riot.route.start()` `riot.route.stop()` methods