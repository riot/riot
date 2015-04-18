<loop-option>
  <select>
    <option each={ data } selected={ id == 2  } value="{ id }">{ name }</option>
  </select>

  this.data = [
      {id: 1, name: 'Peter'},
      {id: 2, name: 'Sherman'},
      {id: 3, name: 'Laura'}
  ]
</loop-option>
