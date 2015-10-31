riot.tag2('stylus-test', '<h3>{opts.title}</h3>', 'stylus-test { display: block; border: 2px; }', '', function(opts) {
    this.foo = function() {}.bind(this)
}, '{ }');