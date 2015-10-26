<loop-optgroup2>
  <select>
    <option selected="{ true }">&lt;Select Option&gt;
    <optgroup each="{ group in data }" label="{ group.name }">
        <option each="{ option in group.options }" value="{ option.value }" disabled={ option.disabled }>{ option.name }
    </optgroup>
  </select>

  this.data = [
    {
      name: 'Group 1',
      options: [ { name: 'Option 1.1', value: 1, disabled: '' },{ name: 'Option 1.2', value: 2, disabled: '1' } ]
    },
    {
      name: 'Group 2',
      options: [ { name: 'Option 2.1', value: 3, disabled: 0 },{ name: 'Option 2.2', value: 4, disabled: true } ]
    }
  ]
</loop-optgroup2>
