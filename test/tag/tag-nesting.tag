
<tag-nesting>

  <inner1 name="my_name" bar="{ bar }" foo={ foo } />

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


</tag-nesting>

<inner1>
  <p>Inner1 foo: { opts.foo.value }</p>
  <p>Inner1 bar: { opts.bar.value }</p>
  <p name="test"></p>
  <inner2 bar={ opts.bar } />

  var bar = opts.bar.value

  echo() {
    this.test.innerHTML = '+ECHOED+'
  }

</inner1>

<inner2>
  <p>Inner2: { opts.bar.value + 50 }</p>
</inner2>