<table-multibody>
  <h3>Bodies</h3>
  <table border=1>
    <tbody each={ body, i in bodies }>
      <tr style="background-color:{ bgcolor[i&amp;1] }"><td each={ body }>{ body[i] }</td></tr>
    </tbody>
  </table>
  <button onclick={ swapColor }>Swap color</button>

  this.bodies = [['A1', 'A2', 'A3'], ['B1', 'B2', 'B3'], ['C1', 'C2', 'C3']]
  this.bgcolor = [ 'white', 'lime' ]
  swapColor(i) {
    this.bgcolor.reverse()
  }
</table-multibody>
