
<loop-nested>
  <div each={ item in items }>
    <div each={ [1, 2] }>
      <p ref="p">{ item.val }</p>
      <loop-nested-item val={ item.val }></loop-nested-item>
    </div>
  </div>

  <script>
    this.items = [{ val: 1 }, { val: 2 }, { val: 3} ]
  </script>
</loop-nested>

<loop-nested-item>
  <p>{ val }<p>

  <script>
    this.val = opts.val
  </script>
</loop-nested-item>