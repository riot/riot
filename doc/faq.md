
title: FAQ
description: none

====

# Frequently asked questions

### Why is this project called Riot?
Riot is against the current trend of boilerplate and unneeded complexity. We think that a small, powerful API and concise syntax are extremely important things on a client-side library.


### Why IE8?
Because it's widely used. According to [Net Market Share](http://www.netmarketshare.com/) the global desktop market share is 19% and according to [StatCounter](http://statcounter.com/demo/browser/) the market share is 2.6%.

Net Market Share stats count every user equally, while StatCounter gives extra weight to heavy web users.

### Is Riot free?
Riot is free, open source and licensed under the MIT License.


### Can I use Riot in production?
We think so. We do that extensively under muut.com website: on registrations, forum settings and on account page. But not all scenarios are thoroughly tested, since 2.0 is a big rewrite and not widely used yet. Please report issues [here](https://github.com/muut/riotjs/issues).


### Should I use dash on the tag name?
W3C specification demands you use a dash in the tag name. Instead of `<person>` you must write `<my-person>`. Obey this rule if you care about W3C. Both work fine.


### Why are there no semicolons in the source code?
Leaving out semicolons makes the code less crowded. This is aligned with our general minimalistic approach. We use single quotes for the same reason. If you contribute to Riot, please leave out semicolons and double quotes.

### Why the use of evil `==` operator?
The equality operator is good when you know how it works. We do this for example:

`node.nodeValue = value == null ? '' : value`

This causes `0` and `false` to be printed but `null` and `undefined` are printed as an empty string. Exactly what we want!


### Can I use `<style>` tags in a .tag file?
Yes. You can use CSS normally inside a tag. The web component standard also has a mechanism of encapsulating of CSS. However, it's unlikely that this improves the overall manageability of your CSS.


### What's the role of jQuery?
Riot reduces the need for jQuery. You no longer need selectors, traversing, events and manipulation features. Some features like delegated events can be useful. jQuery plugins can be used together with Riot.


### Isn't `onclick` evil?
It's not evil, it only looks bad. To have JS and HTML under the same module is more important than aesthetics. The minimal Riot syntax makes event handlers look decent.

### Any future plans?

Yes:

1. Browser based compilation
2. Server side HTML generation and "isomorphic" applications
3. Bigger test suite with server side tests
4. Tag option validation using HTML attributes
