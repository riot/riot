# Contributing to Riot.js

If you’d like to contribute a feature or bug fix, you can [fork](https://help.github.com/articles/fork-a-repo/) Riot or one of its [submodules](https://github.com/riot), commit your changes, & [send a pull request](https://help.github.com/articles/using-pull-requests/).
Please make sure to [search the issue tracker](https://github.com/riot/riot/issues) first.

### Development Process

`master` is considered safe and should be identical to the last release tag. When submitting pull requests please use the `dev` branch.

### Coding Guidelines

Please follow the coding style established in the rest of the codebase.

**Semicolons**<br>
[No](http://blog.izs.me/post/2353458699/an-open-letter-to-javascript-leaders-regarding) [semicolons](http://inimino.org/~inimino/blog/javascript_semicolons), [please](https://www.youtube.com/watch?v=gsfbh17Ax9I)!

**Spacing**<br>
Use two spaces for indentation. No tabs.
Spacing around brackets: `if (foo) {` instead of `if(foo){`

**Quotes**<br>
Single-quoted strings are preferred to double-quoted strings.

**Equality Checking**<br>
Prefer `==` over `===` unless it's a must.

**Bitwise Operations**<br>
Prefer classic conditionals `i < 0` over bitwise operators `!~pos`

### Create a test

Create a test for your specific contribution and submit it with your pull request to ensure the future stability of Riotjs

### Run the tests

Before any pull request please run the following command from your terminal to be sure your changes will not break Riotjs:

```shell
$ make riot
```

### Reporting New Issues

We use [Github Issues](https://github.com/riot/riot/issues) as the Riot.js bug tracker. The best way to get your bug fixed is to provide a reduced test case. jsFiddle, jsBin, and other sites provide a way to give live examples.

- [Bug Report Template](http://riotjs.com/examples/plunker/?app=bug-reporter) on plnkr (preferred)
- [Bug Report Template](http://jsfiddle.net/gianlucaguarini/86m9uepL/) on jsFiddle

### Adding a new Demo

Please just add a link to the bottom of the README.md file


### Updating the documentation

Please go to the [website repository](https://github.com/riot/riot.github.io).


#### We are happy to accept PRs so thank you in advance!

#### Copyright

    You will only Submit Contributions where You have authored 100% of the content.
    You will only Submit Contributions to which You have the necessary rights. This means that if You are employed You have received the necessary permissions from Your employer to make the Contributions.
    Whatever content You Contribute will be provided under the Project License(s).
