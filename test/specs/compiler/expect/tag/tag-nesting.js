
riot.tag('tag-nesting', '<inner1 name="my_name" bar="{ bar }" foo="{ foo }"></inner1>', function(opts) {

  this.foo = { value: 10 }
  this.bar = { value: 25 }

  this.on('mount', function() {
    this.tags.my_name.echo()
  })

  setTimeout(function() {
    this.foo.value = 30
    this.bar.value = 45
    this.update()

  }.bind(this), 600)



});

riot.tag('inner1', '<p>Inner1 foo: { opts.foo.value }</p> <p>Inner1 bar: { opts.bar.value }</p> <p name="test"></p> <inner2 bar="{ opts.bar }"></inner2>', function(opts) {

  var bar = opts.bar.value

  this.echo = function() {
    this.test.innerHTML = '+ECHOED+'
  }.bind(this);


});

riot.tag('inner2', '<p>Inner2: { opts.bar.value + 50 }</p>', function(opts) {

});