<loop-sync-options>
  <loop-sync-options-child each={ child in children } data={ child } class={ active: child.val }></loop-sync-options-child>

  this.children = [{
    val: 'foo'
  },{
    num: 3
  },{
    bool: false
  }]

</loop-sync-options>

<loop-sync-options-child>

  this.on('update', function() {
    this.val = opts.data.val
    this.bool = opts.data.bool
    this.num = opts.data.num
  })

</loop-sync-options-child>