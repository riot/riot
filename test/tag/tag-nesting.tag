
<tag-nesting>

  <inner1 foo={ foo } bar={ bar }/>
  <inner1 foo={ foo } bar={ bar }/>

  this.foo = { value: 10 }
  this.bar = { value: 20 }

  setTimeout(function() {
    this.foo.value = 30
    this.bar.value = 40
    this.update()

  }.bind(this), 300)

</tag-nesting>

<inner1>
  <p>foo: { opts.foo.value }</p>
  <p>bar: { opts.bar.value }</p>
  <inner2 bar={ opts.bar }/>
</inner1>

<inner2>
  <p>Inner: { opts.bar.value + 50 }</p>
</inner2>