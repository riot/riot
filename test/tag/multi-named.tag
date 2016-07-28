<multi-named>
  <input ref="rad" type="radio" value="1">
  <input ref="rad" type="radio" value="2">
  <input ref="rad" type="radio" value="3">
  <input ref="t" id="t" value="1">
  <input each="{v in items}" ref="t_{v}" id="t_{v}" value="{v}">
  <input type="checkbox" ref="c" each="{v in items}" value="{v}">
  <multi-nchild n='child' mount={opts.mountChild}></multi-nchild>

  this.on('mount', opts.mount)
  this.items = [1,2]
</multi-named>

<multi-nchild>
  <input ref={opts.n} value='child'>
  <input type='checkbox' each={v in checks} ref="check" value="{v}">

  this.checks = ['one', 'two', 'three']
  this.on('mount', opts.mount)
</multi-nchild>
