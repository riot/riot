<loop-arraylike>
  <div>
    <p each="{ value, key in arraylike }">{ key } = { value }</p>
  </div>

  var array = [ 'zero', 'one', 'two', 'three' ]
  this.arraylike = Object.create(Array.prototype)
  this.arraylike.push.apply(this.arraylike, array)
</loop-arraylike>
