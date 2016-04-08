
<loop-root>

  <ul>
    <li each={ arr }>{ root }</li>
  </ul>

  this.arr = [{ root: 1 }, { root: 2 }, { root: 3 }]

  splice() {
    this.arr = this.arr.splice(1,2)
  }

</loop-root>