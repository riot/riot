<loop-cols>
  <table>
    <caption>Loop Cols</caption>
    <colgroup>
      <col each={headers}>
    </colgroup>
    <thead>
      <tr>
        <th each={header in headers}>{header}</th>
      </tr>
    </thead>
    <tbody>
      <tr each={row in data}>
        <td each={value in row}>{value}</td>
      </tr>
    </tbody>
  </table>

  this.headers = [
    'Name',
    'Number',
    'Address',
    'City',
    'Contact'
  ]
  this.data = [
    ['Abc', '10', 'A 4B', 'México', 'Juan'],
    ['Def', '20', 'B 50', 'USA', 'Anna'],
    ['Ghi', '30', 'D 60', 'Japan', ''],
    ['Jkl', '40', 'E 1C', 'France', 'Balbina']
  ]

</loop-cols>
