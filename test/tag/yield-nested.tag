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

  <yield-child-2 each={ items } subtitle={ name }>
    <i onclick={ saySomething } ><yield/></i>
    <div class={ selected: isSelected }>
      <b>wooha</b>
    </div>
  </yield-child-2>

  this.greeting = 'from the parent'
  this.items = [
    { name: "subtitle1" },
    { name: "subtitle2" },
    { name: "subtitle3" },
    { name: "subtitle4" },
    { name: "subtitle5" }
  ]

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

<yield-child-2>

  <h1>Greeting</h1>
  <h2>{ opts.subtitle }</h2>
  <yield>
  this.greeting = 'from the child'

</yield-child-2>



