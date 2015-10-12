<loop-numbers-nested>
  <ul each="{ l1, i in data }">
    <li onclick={ onclick } each="{ l2, j in l1 } ">{ i } : { j }</li>
  </ul>
  this.data = [[4,3,2,1], [5,7,6], [8,9]]
  onclick() {
    this.data.reverse()
  }
</loop-numbers-nested>