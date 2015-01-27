
<loop-table>

  <h3>Table with TD loop</h3>

  <table>
    <tr>
      <td each={man in people}>{ man.name }</td>
    </tr>
  </table>

  <table>
    <tr each={man in people}>
      <td>{ man.name }</td>
      <td>{ man.age }</td>
    </tr>
  </table>

  this.people = [
    {name: 'Mike', age: 20},
    {name: 'Tom', age: 30},
    {name: 'Dennis', age: 40}
  ];

</loop-table>
