<loop-events>
  <inner-loop-events onclick={ click } each={ outerCount, outerI in counter }>{ outerCount }</inner-loop-events>
  this.counter = [ 'out' ]
  this.cb = opts.cb
  click(e) {
    this.cb(e, e.item)
  }
</loop-events>

<inner-loop-events>
  <p><yield></yield></p>
  <ul>
    <li each={ innerCount, innerI in counter } onclick={ click }>
      Click me! { innerI } - { innerCount }
      <loop-events-button-1 cb={ cb }></loop-events-button-1>
      <loop-events-button-2 cb={ cb }></loop-events-button-2>
    </li>
  </ul>

  this.counter = [ 'in' ]

  click(e) {
    this.cb(e, e.item)
  }

</inner-loop-events>

<loop-events-button-1>
  <button onclick={ this.click() }>Click me { innerI }</button>
  click(e) {
    opts.cb(e, e.item)
  }
</loop-events-button-1>

<loop-events-button-2>
  <button onclick={ click }>Click me { innerI }</button>

  click(e) {
    opts.cb(e, e.item)
  }
</loop-events-button-2>