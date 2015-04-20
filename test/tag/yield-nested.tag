<yield-parent>
  <h1>Hello, <yield/></h1>

  <yield-child>
    <i onclick={ saySomething } ><yield/></i>
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

<yield-loop>
  <h1>Hello, <yield/></h1>

  <yield-child each={ items }>
    <i onclick={ saySomething } ><yield/></i>
    <div class={ selected: isSelected }>
      <b>wooha</b>
    </div>
  </yield-child>

  this.greeting = 'from the parent'
  this.items = [1,2,3,4,5]

  saySomething() {
    this.greeting = 'I am alive!'
    if (opts.saySomething)
      opts.saySomething()
  }

</yield-loop>


<yield-child>

  <h1>Greeting</h1>
  <yield>
  this.greeting = 'from the child'

</yield-child>



