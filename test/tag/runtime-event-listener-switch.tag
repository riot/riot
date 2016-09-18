<runtime-event-listener-switch>
  <p class='first' onmouseenter={ flag ? ev1 : ev2 } onclick={ flag ? ev1 : ev2 }>Click</p>
  <p class='second' onmouseenter={ flag ? ev1 : ev2 } onclick={ flag ? ev1 : ev2 }>Click</p>

  <script>
    this.flag = true

    ev1(name) {
      this.flag = false
      this.opts.cb('ev1')
    }

    ev2(name) {
      this.flag = true
      this.opts.cb('ev2')
    }

  </script>
</runtime-event-listener-switch>