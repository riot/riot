<yield-parent>
  <h1>Hello, <yield></h1>

  <yield-child>
    <i onclick={ saySomething } >{ greeting }</i>
    <div class={ selected: isSelected }>
      <b>wooha</b>
    </div>
  </yield-child>

  this.greeting = 'from the parent'

  saySomething() {
    this.greeting = 'I am alive!'
    if (opts.saySomething)
      opts.saySomething()
  }

</yield-parent>


<yield-child>

  <h1>Greeting, <yield></h1>
  this.greeting = 'from the child'


</yield-child>