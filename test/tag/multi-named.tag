<multi-named>
  <input name="rad" type="radio" value="1">
  <input name="rad" type="radio" value="2">
  <input name="rad" type="radio" value="3">
  <input name="t" id="t" value="1">
  <input each="{v in items}" name="t_{v}" id="t_{v}" value="{v}">
  <input type="checkbox" name="c" each="{v in items}" value="{v}">
  <multi-nchild n='child' mount={opts.mountChild}></multi-nchild>

  this.on('mount', opts.mount)
  this.items = [1,2]
</multi-named>

<multi-nchild>
  <input name={opts.n} value='child'>
  <input type='checkbox' each={v in checks} name="check" value="{v}">

  this.checks = ['one', 'two', 'three']
  this.on('mount', opts.mount)
</multi-nchild>

