<table-thead-tfoot>

  <thead>
    <tr><th each={ header }>{ cell }</th></tr>
  </thead>
  <tfoot>
    <tr><td each={ footer }>{ cell }</td></tr>
  </tfoot>
  <tbody>
    <tr each={ col in rows }>
      <td each={ cell in col }>{ cell }</td>
    </tr>
  </tbody>

  this.header = opts.header
  this.footer = opts.footer
  this.rows = opts.rows

</table-thead-tfoot>
