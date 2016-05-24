<if-unmount>
  <if-uchild if={cond} cb={cb} />
  <div if={cond}>
    <if-uchild cb={cb} />
  </if-uchild>

  <div each={items}>
    <if-uchild if={bool} cb={cb} />
  </div>

  this.cond = true
  this.items = [{bool: true}]
  this.cb = opts.cb
</if-unmount>

<if-uchild>
  <span>Foo</span>
  this.on('unmount', function() { opts.cb() })
</if-uchild>
