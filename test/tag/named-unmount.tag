<named-unmount>
  <div name='first' if={cond}>
    <div name='second'></div>
  </div>

  <div each={item in items}>
    <div name={item}></div>
  </div>

  this.cond = false
  this.items = []
</named-unmount>
