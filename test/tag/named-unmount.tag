<named-unmount>
  <div ref='first' if={cond}>
    <div ref='second'></div>
  </div>

  <div each={item in items}>
    <div ref={item}></div>
  </div>

  this.cond = false
  this.items = []
</named-unmount>
