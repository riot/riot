
<table-data>

  <h3>Cells</h3>
  <table border=1>
    <tr><th each={ rows }>{ cell }</th></tr>
    <tr><td each={ rows }>{ cell }</td></tr>
  </table>

  <h3>Rows</h3>
  <table border=1>
    <tr each={ rows }>
      <td>{ cell }</td>
      <td>{ cell } another</td>
    </tr>
  </table>

  this.rows = [{ cell: 'One'}, { cell: 'Two'}, { cell: 'Three'}]

</table-data>