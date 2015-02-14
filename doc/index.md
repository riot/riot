
title: Riot 2.0 | A React- like UI library
subtitle: Why Riot?
description: And why we need a new UI library
body_id: riot-home
hero: true

====

# 1. Custom tags

Riot brings custom tags to all browsers starting from IE8.

``` html
<todo>

  <!-- layout -->
  <h3>{ opts.title }</h3>

  <ul>
    <li each={ item, i in items }>{ item }</li>
  </ul>

  <form onsubmit={ add }>
    <input>
    <button>Add #{ items.length + 1 }</button>
  </form>

  <!-- logic -->
  &lt;script>
    this.items = []

    add(e) {
      var input = e.target[0]
      this.items.push(input.value)
      input.value = ''
    }
  </script>

</todo>
```
A custom tag glues relevant HTML and JavaScript together forming a reusable component. Think React + Polymer but with ejoyable syntax and a small learning curve.


### Human-readable

Custom tags let you build complex views with HTML. Your application might look something like this:

``` html
<body>

  <h1>Acme community</h1>

  <forum-header/>

  <forum-content>
    <forum-threads/>
    <forum-sidebar/>
  </forum-content>

  <forum-footer/>

  &lt;script>riot.mount('*', { api: forum_api })</script>
</body>
```

HTML syntax is the *de facto* language of the web and it's designed for building user interfaces. The syntax is explicit, nesting is inherent to the language, and attributes offer a clean way to provide options for custom tags.

<span class="tag">note</span> the tags are [converted](compiler.html) to JavaScript before browsers can execute them.


### Virtual DOM
- Absolutely the smallest possible amount of DOM updates and reflows.
- One way data flow: updates and unmounts are propagated downwards from parent to children.
- Expressions are pre-compiled and cached for high performance.
- Lifecycle events for more control.


### Close to standards
- No proprietary event system.
- Event normalization for IE8.
- The rendered DOM can be freely manipulated with other tools.
- No extra HTML root elements or `data-` attributes.
- Plays well with jQuery.


### Use your favorite tools
- Create tags with CoffeeScript, Jade, Typescript, ES6 or [any pre-processor](compiler.html#pre-processors) you want.
- Integrate with NPM, CommonJS, AMD, Bower or Component
- Develop with [Gulp](https://github.com/e-jigsaw/gulp-riot), [Grunt](https://github.com/ariesjia/grunt-riot) or [Browserify](https://github.com/jhthorsen/riotify) plugins



# 2. Simple and minimalistic

Minimalism sets Riot apart from others:


### 1. Enjoyable syntax

One of the design goals was to introduce a powerful tag syntax with as little boilerplate as possible:

- Power shortcuts: `class={ enabled: is_enabled, hidden: hasErrors() }`.
- No extra brain load such as `render`, `state`, `constructor` or `shouldComponentUpdate`
- Interpolation: `Add #{ items.length + 1 }` or `class="item { selected: flag }"`
- `<script>` tag to enclose the logic is optional
- Compact ES6 method syntax


### 2. Small learning curve

Riot has between 10 and 100 times fewer API methods than other UI libraries.

1. Less to learn. Fewer books and tutorials to view
2. Less proprietary stuff and more standard stuff


### 3. Tiny size

<small><em>react.min.js</em> – 127KB</small>
<span class="bar red"></span>

<small><em>polymer.min.js</em> – 120KB</small>
<span class="bar red" style="width: 94%"></span>

<small><em>riot.min.js</em> – 6.7KB</small>
<span class="bar blue" style="width: 4.8%"></span>


1. Fewer bugs.
4. Faster to parse and cheaper to download.
3. Embeddable. The library should be smaller than the application.
4. Less to maintain. We don't need a big team to maintain Riot.

### 4. Small, but complete

Riot has all the essential building blocks for modern client-side applications:

- "Reactive" views for building user interfaces.
- Event library for building APIs with isolated modules.
- Router for taking care of URL and the back button.

Riot is an "open stack". It's meant for developers who want to avoid framework specific idioms. The generic tools let you mix and match design patterns. Systems like Facebook Flux can be [self-made](https://github.com/jimsparkman/RiotControl).


==== .tweets.section

Today I have used #riotjs 2.0 for the first time and I could admit that It will be a long term relationship #js highly recommended. [@gianlucaguarini](https://twitter.com/gianlucaguarini/status/559756081862574080)

I am not a fan of the custom tags and DOM events binding but I've tested riotjs and it is damn fast/performant #impressed. [‏@gianlucaguarini](https://twitter.com/gianlucaguarini/status/559429908179714049)

looking at RiotJS https://muut.com/riotjs/  - blown away by its simplicity. [@defeated](https://twitter.com/defeated/status/559215403541757952)

Played with riot.js and like it so much more than react. Minimalistic, fast and a comprehensible API. [@juriansluiman](https://twitter.com/juriansluiman/status/560399379035865088)

I looked at the riot.js example, and it feels so clean, it's scary. [@paulbjensen](https://twitter.com/paulbjensen/status/558378720403419137)

==== .section.narrow

# Conclusion

Riot is React + Polymer + models + routing without the bloat. It works today, even on IE8. It's dead simple to use and it weighs almost nothing. No reinventing the wheel, but rather taking the good parts of what's there and making the simplest tool possible.

We should focus on reusable components instead of templates. According to the developers of React:

> "Templates separate technologies, not concerns."

By having related layout and logic together under the same component the overall system becomes cleaner. We respect React for this important insight.


#### Muut blog: [From React to Riot 2.0](/blog/technology/riot-2.0/) | .tall


