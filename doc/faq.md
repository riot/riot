
title: Riot FAQ
subtitle: FAQ
description: none

====

# Frequently asked questions

### Why is this project called Riot?
Riot is against the current trend of boilerplate and unneeded complexity. We think that a small, powerful API and concise syntax are extremely important things on a client-side library.


### Is Riot free?
Riot is free, open source and licensed under the MIT License. Free from [Additional Grant of Patent Rights](https://github.com/facebook/react/blob/master/PATENTS).


### Can I use Riot in production?
We think so. We do that extensively under muut.com website: on registrations, forum settings and on account page. But not all scenarios are thoroughly tested, since Riot 2 is a big rewrite and not widely used yet. Please report issues [here](https://github.com/riot/riot/issues).


### Should I use dash on the tag name?
W3C specification demands you use a dash in the tag name. Instead of `<person>` you must write `<my-person>`. Obey this rule if you care about W3C. Both work fine.


### Why are there no semicolons in the source code?
Leaving out semicolons makes the code less crowded. This is aligned with our general minimalistic approach. We use single quotes for the same reason. If you contribute to Riot, please leave out semicolons and double quotes.

### Why the use of evil `==` operator?
The equality operator is good when you know how it works. We do this for example:

`node.nodeValue = value == null ? '' : value`

This causes `0` and `false` to be printed but `null` and `undefined` are printed as an empty string. Exactly what we want!


### Can I use `style` tags in a .tag file?
Yes. You can use CSS normally inside a tag. The web component standard also has a mechanism of encapsulating of CSS. However, it's unlikely that this improves the overall manageability of your CSS.


### What's the role of jQuery?
Riot reduces the need for jQuery. You no longer need selectors, traversing, events and manipulation features. Some features like delegated events can be useful. jQuery plugins can be used together with Riot.


### Isn't `onclick` evil?
It's not evil, it just looks "old". To have JS and HTML under the same module is more important than aesthetics. The minimal Riot syntax makes event handlers look decent.

### Any future plans?

Yes we do, we have a lots of ideas and we keep updating and enhancing the project thanks to the help of an active and democratic community on [github](https://github.com/riot). Please [follow us](https://github.com/riot/riot) to participate to our discussions and to keep yourself updated about latest features of riot

