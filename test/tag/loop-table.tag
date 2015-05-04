<loop-table>
  <table>
    <tr each={ data }>
        <td>{ id }</td>
        <td>{ name }</td>
    </tr>
  </table>

  this.data = [
      {id: 1, name: 'Peter'},
      {id: 2, name: 'Sherman'},
      {id: 3, name: 'Laura'}
  ]
</loop-table>