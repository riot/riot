<loop-object-conditional>
  <div ref='items' each={ item,key in items } if={ item.display }>
    { item.tag }
  </div>

  <script>
    this.items = {
      one: {name: 'one', display: '1', tag: 'field-1'},
      two: {name: 'two', display: 1, tag: 'field-2'},
      three: {name: 'three', display: true, tag: 'field-1'},
      four: {name: 'four', display: 0, tag: 'field-2'},
      five: {name: 'five', display: false, tag: 'field-1'},
      six: {name: 'six', display: '0', tag: 'field-1'}
    }
  </script>
</loop-object-conditional>