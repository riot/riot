<table-thead-tfoot>

  <h3>Header</h3>
  <table>
    <thead>
      <tr><th each={ header }>{ cell }</th></tr>
    </thead>
    <tbody>
      <tr each={ col in rows }>
        <td each={ cell in col }>{ cell }</td>
      </tr>
    </tbody>
  </table>

  <h3>Footer</h3>
  <table>
    <tfoot>
      <tr><td each={ footer }>{ cell }</td></tr>
    </tfoot>
    <tbody>
      <tr each={ col in rows }>
        <td each={ cell in col }>{ cell }</td>
      </tr>
    </tbody>
  </table>

  <h3>Both</h3>
  <table>
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
  </table>

  this.header = opts.header
  this.footer = opts.footer
  this.rows = opts.rows

</table-thead-tfoot>
