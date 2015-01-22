
<loop-strings>

  <h3>Array of primitives</h3>

  <p each="{ val, i in arr }">#{ i }: <strong>{ val }</strong></p>

  <button onclick={ set }>Update</button>

  this.arr = [ 'first', 110, Math.random(), 27.12 ]

  set() {
    this.arr[0] = 'manipulated'
    this.arr[2] = Math.random()
  }

</loop-strings>