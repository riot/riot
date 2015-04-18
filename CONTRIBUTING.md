# Contributing to Riot.js

If you’d like to contribute a feature or bug fix, you can [fork](https://help.github.com/articles/fork-a-repo/) Riot, commit your changes, & [send a pull request](https://help.github.com/articles/using-pull-requests/).
Please make sure to [search the issue tracker](https://github.com/mutt/riotjs/issues) first.

### Development Process

`master` is considered safe and should be identical to the last release tag. When submitting pull requests please use the `dev` branch.

### Coding Guidelines

Please follow the coding style established in the rest of the codebase.

  **Spacing**:<br>
  Use two spaces for indentation. No tabs.
  Spacing around brackets: `if (foo) {` instead of `if(foo){`

##### Thank you in advance! We are happy to merge your code.

  **Quotes**:<br>
  Single-quoted strings are preferred to double-quoted strings.

  **Equality Checking**:<br>
  Prefer `==` over `===` unless it's a must.

  **Bitwise Operations**:<br>
  Prefer classic conditionals `i < 0` over bitwise operators `!~pos`

### Create a test

Create a test for your specific contribution and submit it with your pull request to ensure the future stability of Riotjs

### Run the tests

Before any pull request please run the following command from your terminal to be sure your changes will not break Riotjs:

```shell
$ make riot
```

### Reporting New Issues

  We use [Github Issues](https://github.com/muut/riotjs/issues) as the Riot.js bug tracker. The best way to get your bug fixed is to provide a reduced test case. jsFiddle, jsBin, and other sites provide a way to give live examples.

- [Riot.js Bug Report Template](http://jsfiddle.net/cognitom/wf7bkvur/) on jsFiddle

### Adding a new Demo

  Please just add a link to the bottom of the README.md file

#### We are happy to accept PRs so thank you in advance!

