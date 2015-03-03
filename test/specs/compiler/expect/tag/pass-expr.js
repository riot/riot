
riot.tag('expr-parent', '<expr-child code="{ code }"></expr-child>', function(opts) {
  this.code = 'foo { bar }'

});

riot.tag('expr-child', '<pre>{ opts.code } == foo \\{ bar \\}</pre>', function(opts) {

  console.info(opts)

});
