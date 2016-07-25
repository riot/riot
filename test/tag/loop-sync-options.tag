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

  this.on('update mount', function() {
    this.val = this.opts.data.val
    this.bool = this.opts.data.bool
    this.num = this.opts.data.num
  })

</loop-sync-options-child>