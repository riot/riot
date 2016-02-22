<input-values>
  <input name="i" value={ message } type="text" />
  this.message = 'hi'
  this.on('mount', function() {
    this.i.value = 'foo'
  })
</input-values>
