<loop-swap-type>
  <div each="{ item in current }">{ item.num }</div>

  var arr = [
    { num: 1 },
    { num: 2 }
  ]

  var obj = {
    0: { num: 3 },
    1: { num: 4 }
  }

  this.current = arr
  this.swap = function () {
    if (Array.isArray(this.current)) {
      this.current = obj
    } else {
      this.current = arr
    }
  }
</loop-swap-type>
