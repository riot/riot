<named-select>
  <select name="daSelect" each={ item in items }>
    <option>---</option>
    <option each={ option in item }>{ option }</option>
  </select>

  this.items = [
    ['foo', 'bar'],
    ['baz', 'foo']
  ]
</named-select>