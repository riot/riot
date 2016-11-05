<loop-conditional>
  <div onclick={ change } if={ value <= 2 } each={ items }>
    <loop-conditional-nested-item value={value} ></loop-conditional-nested-item>
  </div>
  <loop-conditional-item onclick={ change } each={ items } if={ value <= 2 }>
  </loop-conditional-item>

  <footer>
    <loop-conditional-nested-item each={ items } if={false}></loop-conditional-nested-item>
  </footer>

  this.items = [{value: 1},{value: 2}, {value: 3 }]

  change() {
    this.items = [{value: 1}, {value: 2}, {value: 3}, {value: 4}, {value: 2}, { value: 1 }]
    this.update()
  }

</loop-conditional>
<loop-conditional-item>
  <p>{ opts.value }</p>
</loop-conditional-item>

<loop-conditional-nested-item>
  <p>{ opts.value }</p>
</loop-conditional-nested-item>
