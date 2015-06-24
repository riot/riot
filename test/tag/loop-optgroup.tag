<loop-optgroup>
  <select>
    <optgroup each="{ group in data }" label="{ group.name }">
        <option each="{ option in group.options }" selected="{ option.selected }" value="{ option.value }">{ option.name }</option>
    </optgroup>
  </select>

  this.data = [
    {
      name: 'Group 1',
      options: [ { name: 'Option 1.1', value: 1, selected: '' },{ name: 'Option 1.2', value: 2, selected: '' } ]
    },
    {
      name: 'Group 2',
      options: [ { name: 'Option 2.1', value: 3, selected: 0 },{ name: 'Option 2.2', value: 4, selected: 'selected' } ]
    }
  ]
</loop-optgroup>
