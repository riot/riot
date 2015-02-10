
title: Riot API
description: none

====

# General

### riot.version

the current Riot version number as string: '{{ riot_version }}'


### riot.settings.brackets | #brackets

A global Riot setting to customize the start and end tokens of the expressions. For example


``` js
riot.settings.brackets = '\{\{ }}'
```

let's you write expressions `<p>\{\{ like_this }}</p>`. The start and end is separated with a space character.


<include tags.md />
<include compiler.md />
<include observable.md />
<include router.md />






