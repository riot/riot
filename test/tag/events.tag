
<events>
  <p onclick={do}>click</p><br>
  <p onmousedown={do}>mousedown</mousedown></p><br>
  <textarea onchange={do}>change</textarea><br>
  <select onchange={do}><option>1</option><option>2</option></select><br>
  <input onkeydown={do} value=keydown><br>
  do(e) {
    console.log(e)
  }
</events>
