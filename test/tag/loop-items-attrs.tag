<loop-items-attrs>
  <loop-items-attrs-item
    each={ items }
    data-color={ color }>
  </loop-items-attrs-item>

  <script>
    this.items = [{ color: 'red' }, { color: 'orange' }]
  </script>
</loop-items-attrs>

<loop-items-attrs-item>
  <p ref="color">{ color }</p>
</loop-items-attrs-item>