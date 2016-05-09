<should-update>
  <p>{ count }</p>

  this.count = 0

  shouldUpdate() { return false }

  this.on('update', function() {
    this.count ++
  })
</should-update>
