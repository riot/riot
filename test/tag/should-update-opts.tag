<should-update-opts>
  <p>{ count }</p>

  this.count = 0

  shouldUpdate(data, opts) {
    return opts.shouldUpdate
  }

  this.on('update', function() {
    this.count ++
  })
</should-update-opts>
