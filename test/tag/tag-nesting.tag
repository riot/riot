
<tag-nesting>

  <inner1 bar="{ bar }" foo={ foo } />

  this.foo = { value: 10 }
  this.bar = { value: 20 }

  setTimeout(function() {
    this.foo.value = 30
    this.bar.value = 40
    this.update()

  }.bind(this), 300)

</tag-nesting>

<inner1>
  <p>Inner1 foo: { opts.foo.value }</p>
  <p>Inner1 bar: { opts.bar.value }</p>
  <inner2 bar={ opts.bar } />
</inner1>

<inner2>
  <p>Inner2: { opts.bar.value + 50 }</p>
</inner2>