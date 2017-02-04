<loop-bug-2240>
  <ul>
    <li each={ item in items } ref='items'>{ item.value }</li>
  </ul>
  <script>
    this.items = [
      { value: 'foo' },
      { value: 'bar' },
      { value: 'baz' }
    ]
  </script>
</loop-bug-2240>