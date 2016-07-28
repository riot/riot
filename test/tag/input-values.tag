<input-values>
  <input name="i" value={ message } type="text" />
  this.message = 'hi'
  this.on('mount', function() {
    this.refs.i.value = 'foo'
  })
</input-values>
