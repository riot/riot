<multi-named>
  <input name="rad" type="radio" value="1">
  <input name="rad" type="radio" value="2">
  <input name="rad" type="radio" value="3">
  <multi-nchild n='child'></multi-nchild>
</multi-named>

<multi-nchild>
  <input name={opts.n} value='child'>
  <input type='checkbox' each={v in checks} name="checks" value="{v}">

  this.checks = ['one', 'two', 'three']
</multi-nchild>

