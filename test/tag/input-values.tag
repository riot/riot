<input-values>
  <input ref="i" value={ message } type="text" />
  this.message = 'hi'
  this.on('mount', function() {
    this.message = 'foo'
  })
</input-values>
