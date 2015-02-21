
<my-tag>
  <p each={ items }>{ val }</p>

  this.on('mount', function() {
    this.update({ items: [{ val: 'kissa' }, { val: 'koira' }] })
  })
</my-tag>
