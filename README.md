
[![Riot logo](http://riotjs.com/img/logo/riot480x.png)](http://riotjs.com/)

## Simple and elegant component-based UI library

[![Build Status][travis-image]][travis-url]
[![Riot Forum][riot-forum-image]][riot-forum-url]
[![Join the chat at https://gitter.im/riot/riot][gitter-image]][gitter-url]
[![Join the chat (ja) at https://riot-jp-slackin.herokuapp.com/][slack-ja-image]][slack-ja-url]
[![OpenCollective Backers][backer-badge]][backer-url] [![OpenCollective Sponsors][sponsor-badge]][sponsor-url]

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Code Quality][codeclimate-image]][codeclimate-url]

[![Sauce Test Status][saucelabs-image]][saucelabs-url]

# Important

This branch hosts the work for riot4 it's not stable and it's meant to be used only by the riot core contributors

### How to contribute

If you are reading this it's already a good sign and we are thankful for it! We try our best working as much as we could on riot but your help is always appreciated.

If you want to contribute to riot helping us maintaining the project please check first the list of [our open issues](https://github.com/riot/riot/issues) to understand whether there is a task where you could help.

Riot is mainly developed on UNIX systems so you will be able to run all the commands necessary to build and test the library using our [Makefile](Makefile). If you are on a Microsoft machine it could be harder to set up you development environment properly.

Following the steps below you should be able to properly submit your patch to the project

#### 1) Clone the repo and browse to the riot folder

```shell
$ git clone git@github.com:riot/riot.git && cd riot
```
#### 2) Set up your git branch

```shell
$ git checkout -b feature/my-awesome-patch
```

#### 3) Install the npm dependencies

```shell
$ npm i
```

#### 4) Build and test riot using the Makefile

```shell
# To build and test riot
$ make riot

# To build without testing
$ make raw

# To build anytime you change a src file
$ make watch

# To bench riot ( it requires ctrl+c to exit )
$ make perf
```

#### 5) Pull request only against the `dev` branch making sure you have read [our pull request template](.github/PULL_REQUEST_TEMPLATE.md)

#### 6) Be patient


### Credits

Riot is made with :heart: by many smart people from all over the world. Thanks to all the contributors<br>
It's actively maintained by:
<table>
  <tbody>
    <tr>
      <td align="center" valign="top">
        <img width="125" height="125" src="https://github.com/rsbondi.png?s=125">
        <br>
        <a href="https://github.com/rsbondi">Richard Bondi</a>
      </td>
      <td align="center" valign="top">
        <img width="125" height="125" src="https://github.com/GianlucaGuarini.png?s=125?s=125">
        <br>
        <a href="https://github.com/GianlucaGuarini">Gianluca Guarini</a>
      </td>
      <td align="center" width="20%" valign="top">
        <img width="125" height="125" src="https://github.com/cognitom.png?s=125">
        <br>
        <a href="https://github.com/cognitom">Tsutomu Kawamura</a>
      </td>
      <td align="center" valign="top">
        <img width="125" height="125" src="https://github.com/aMarCruz.png?s=125">
        <br>
        <a href="https://github.com/aMarCruz">Alberto Martínez</a>
      </td>
      <td align="center" valign="top">
        <img width="125" height="125" src="https://github.com/rogueg.png?s=125">
        <br>
        <a href="https://github.com/rogueg">Grant Marvin</a>
      </td>
      <td align="center" valign="top">
        <img width="125" height="125" src="https://github.com/tipiirai.png?s=125">
        <br>
        <a href="https://github.com/tipiirai">Tero Piirainen</a>
      </td>
     </tr>
  </tbody>
</table>

## Official Website

http://riotjs.com/

## Backers

Support us with a monthly donation and help us continue our activities. [Become a backer][support-url]

[![Backers][backers-image]][support-url]

## Sponsors

Become a sponsor to get your logo on our README. [Become a sponsor][support-url]

[![Sponsors][sponsors-image]][support-url]


[travis-image]:https://img.shields.io/travis/riot/riot.svg?style=flat-square
[travis-url]:https://travis-ci.org/riot/riot

[license-image]:http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square
[license-url]:LICENSE.txt

[npm-version-image]:http://img.shields.io/npm/v/riot.svg?style=flat-square
[npm-downloads-image]:http://img.shields.io/npm/dm/riot.svg?style=flat-square
[npm-url]:https://npmjs.org/package/riot

[riot-forum-image]:https://img.shields.io/badge/muut-JOIN_FORUM%E2%86%92-ff0044.svg?style=flat-square
[riot-forum-url]:http://riotjs.com/forum/

[coverage-image]:https://img.shields.io/coveralls/riot/riot/dev.svg?style=flat-square
[coverage-url]:https://coveralls.io/r/riot/riot?branch=dev

[saucelabs-image]:https://saucelabs.com/browser-matrix/testsriotjs.svg?1
[saucelabs-url]:https://saucelabs.com/u/testsriotjs

[gitter-image]:https://img.shields.io/badge/GITTER-JOIN_CHAT_%E2%86%92-1dce73.svg?style=flat-square
[gitter-url]:https://gitter.im/riot/riot?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge

[slack-ja-image]:https://img.shields.io/badge/SLACK_(ja)-JOIN_CHAT_%E2%86%92-551a8b.svg?style=flat-square
[slack-ja-url]:https://riot-jp-slackin.herokuapp.com/

[codeclimate-image]:https://img.shields.io/codeclimate/github/riot/riot.svg?style=flat-square
[codeclimate-url]:https://codeclimate.com/github/riot/riot

[donations-campaign-url]:https://pledgie.com/campaigns/31139
[donations-campaign-image]:https://pledgie.com/campaigns/31139.png?skin_name=chrome


[backer-url]: #backers
[backer-badge]: https://opencollective.com/riot/backers/badge.svg?color=blue
[sponsor-url]: #sponsors
[sponsor-badge]: https://opencollective.com/riot/sponsors/badge.svg?color=blue

[support-url]: https://opencollective.com/riot#support

[backers-image]: https://opencollective.com/riot/backers.svg
[sponsors-image]: https://opencollective.com/riot/sponsors.svg
