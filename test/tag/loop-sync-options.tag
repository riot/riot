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

  function updateOpts() {
    this.val = opts.data.val
    this.bool = opts.data.bool
    this.num = opts.data.num
  }

  this.on('mount', updateOpts)
  this.on('update', updateOpts)

</loop-sync-options-child>
