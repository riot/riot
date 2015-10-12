<loop-unshift>
  <loop-unshift-item each={ item in items } data={ item }></loop-unshift-item>
  this.items = [{
    name: 'woo'
  }, {
    name: 'bar'
  }]
</loop-unshift>

<loop-unshift-item>
  <p>{ name }</p>
  this.name = opts.data.name
</loop-unshift-item>