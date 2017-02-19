<should-update>
  <p ref="count">{ count }</p>

  this.count = 0

  shouldUpdate(data) { return data }

  this.on('update', function() {
    this.count ++
  })
</should-update>
