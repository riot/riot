<virtual-conditional>
  <virtual if={ user != null }>
    <p>{ user.name }</p>
    <virtual-conditional-child></virtual-conditional-child>
  </virtual>

  <script>
    this.childMountCount = 0
    this.user = null
  </script>
</virtual-conditional>

<virtual-conditional-child>
  <p>hi</p>

  <script>
    this.on('mount', function() {
      this.parent.childMountCount ++
    })
  </script>
</virtual-conditional-child>