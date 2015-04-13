<loop-option>
  <select>
    <option each={ data } selected={ selected } value="{ this.id }">{ this.name }</option>
  </select>

  this.data = [
      {id: 1, name: 'Peter'},
      {id: 2, name: 'Sherman', selected: true},
      {id: 3, name: 'Laura'}
  ]
</loop-option>
