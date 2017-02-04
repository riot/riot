<loop-bug-2242>
  <loop-bug-2242-child each={ items }></loop-bug-2242-child>
  <script>
    this.items = [1, 2, 3]
  </script>
</loop-bug-2242>

<loop-bug-2242-child>
  <p>foo</p>
  <script>
    this.on('mount', function() {
      this.inDOM = document.body.contains(this.root)
    })
  </script>
</loop-bug-2242-child>