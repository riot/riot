<loop-inherit-mount>
  <button type="button" onclick="{add}">add</button>
  <div each="{list}">
    <loop-inherit-mount-child name="child"></loop-inherit-mount-child>
  </div>
  <script>
    this.list = []

    add() {
      this.list.push({
        test: 'test'
      })
    }
  </script>
</loop-inherit-mount>

<loop-inherit-mount-child>
  <script>
    this.one('mount', function () {
      this.result = this.test
    })
  </script>
</loop-inherit-mount-child>
