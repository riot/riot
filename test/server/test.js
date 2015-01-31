
global.riot = {}

var tag_html = [
  '<p if="{ opts.foo == 9 }">',
    'foo: { opts.foo }',
  '</p>'
].join('\n')


return echo(tag_html)



require('../../lib/tmpl')

var TAGS = {}

riot.tag = function(name, html, fn) {
  TAGS[name] = { html: html, fn: fn }
}

// import tags
riot.tag('test', tag_html, function(opts) {

})

var html = "BEGIN <test></test> END"

riot.mount = function(tagName, opts) {

  var impl = TAGS[tagName],
      tag = { root: {}, opts: opts, parent: {} }

  impl.fn.call(tag, opts)

  console.info(riot._tmpl(impl.html, tag))
}

riot.mount('test', { foo: 809, bar: 987987 })
