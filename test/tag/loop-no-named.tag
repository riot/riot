<loop-no-named>
  <div each={ name, i in list } no-named-elements>
  { name }
    <div id={ name } value={ i }>
  </div>

  this.list = [ 'first', 'two' ];
</loop-no-named>
