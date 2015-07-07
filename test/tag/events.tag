
<events>
  <p onclick={do}>click</p><br>
  <p onmousedown={do}>mousedown</mousedown></p><br>
  <textarea onchange={do}>change</textarea><br>
  <select onchange={do}><option>1</option><option>2</option></select><br>
  <input onkeydown={do} value=keydown><br>
  <events-child each={ val, index in items } onclick={ parent.opts.cb }></events-child>

  do(e) {
    console.log(e)
  }

  this.items = [1,2,3]

</events>

<events-child>
  <div onclick={ opts.onclick }>Click me</div>
</events-child>
