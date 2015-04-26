<loop-named>
  <p each={ name, i in list }>
  { name }
  <input type="text" name={ name } value={ i }>
  </p>

  this.list = [ 'first', 'two' ];
</loop-named>
