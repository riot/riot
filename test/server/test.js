
global.riot = {}

require('../../lib/tmpl')

var TAGS = {}

riot.tag = function(name, html, fn) {
  TAGS[name] = { html: html, fn: fn }
}

// import tags
riot.tag('test', '<p>foo: { opts.foo }</p> <p>bar: { opts.bar }</p>', function(opts) {

})

var html = "BEGIN <test></test> END"

riot.mount = function(tagName, opts) {

  var impl = TAGS[tagName],
      tag = { root: {}, opts: opts, parent: {} }

  impl.fn.call(tag, opts)

  console.info(riot._tmpl(impl.html, tag))
}

riot.mount('test', { foo: 809, bar: 987987 })