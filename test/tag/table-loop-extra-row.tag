
<table-loop-extra-row>

  <h3>Rows</h3>
  <table border=1>
    <tr>
      <td>Extra</td>
      <td>Row1</td>
    </tr>
    <tr each={ rows }>
      <td>{ cell }</td>
      <td>{ cell } another</td>
    </tr>
    <tr>
      <td>Extra</td>
      <td>Row2</td>
    </tr>
  </table>

  this.rows = [{ cell: 'One'}, { cell: 'Two'}, { cell: 'Three'}]

</table-loop-extra-row>