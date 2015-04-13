<loop-option-selected>
  <select>
    <option each={ data } value="{ this.id }" selected="{ this.id == 1}">{ this.name }</option></option>
  </select>

  this.data = [
      {id: 1, name: 'Peter'},
      {id: 2, name: 'Sherman'},
      {id: 3, name: 'Laura'}
  ]
</loop-option-selected>
