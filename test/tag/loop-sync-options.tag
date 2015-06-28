<loop-sync-options>
  <loop-sync-options-child each={ children }></loop-sync-options-child>

  this.children = [{
    val: 'foo'
  },{
    num: 3
  },{
    bool: false
  }]

</loop-sync-options>

<loop-sync-options-child>
  this.val = opts.val
  this.bool = opts.bool
  this.num = opts.num
</loop-sync-options-child>