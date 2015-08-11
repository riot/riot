<loop-conditional>
  <div onclick={ change } if={ value <= 2 } each={value in items}>
    <loop-conditional-nested-item value={value} ></loop-conditional-nested-item>
  </div>
  <loop-conditional-item onclick={ change } each={ value in items } value={ value } if={ value <= 2 }>
  </loop-conditional-item>

  this.items = [1,2,3]

  change() {
    this.items = [1,2,3,4,2,1]
    this.update()
  }

</loop-conditional>
<loop-conditional-item>
  <p>{ opts.value }</p>
</loop-conditional-item>

<loop-conditional-nested-item>
  <p>{ opts.value }</p>
</loop-conditional-nested-item>
