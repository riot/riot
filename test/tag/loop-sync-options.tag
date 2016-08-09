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

  function sync() {
    this.val = opts.data.val
    this.bool = opts.data.bool
    this.num = opts.data.num
  }

  this.on('update', sync).on('mount', sync)

</loop-sync-options-child>