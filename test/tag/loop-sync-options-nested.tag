<loop-sync-options-nested>
  <div each={ child, index in children } reorder="true">
    <loop-sync-options-nested-child data={ child }></loop-sync-options-nested-child>
  </div>


  this.children = [{
    val: 'foo'
  },{
    num: 3
  },{
    bool: false
  }]

</loop-sync-options-nested>

<loop-sync-options-nested-child>
  this.val = opts.data.val
  this.bool = opts.data.bool
  this.num = opts.data.num

  this.on('update', function() {
    this.val = opts.data.val
    this.bool = opts.data.bool
    this.num = opts.data.num
  })
</loop-sync-options-nested-child>

<loop-sync-options-nested-wrapper>
  <loop-sync-options-nested></loop-sync-options-nested>
</loop-sync-options-nested-wrapper>