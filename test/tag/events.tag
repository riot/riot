
<events>
  <p onclick={ doSomething }>
    click
  </p><br>
  <p onmousedown={ doSomething }>
    mousedown
  </p><br>
  <textarea onchange={ doSomething }>
    change
  </textarea><br>
  <select onchange={ doSomething }>
    <option>1</option>
    <option>2</option>
  </select>
  <br>
  <input onkeydown={ doSomething } value=keydown><br>
  <events-child each={ val, index in items } onclick={ parent.opts.cb }></events-child>

  doSomething(event) {
    //console.log(event)
  }

  this.items = [1,2,3]

</events>

<events-child>
  <div onclick={ opts.onclick }>Click me</div>
</events-child>
