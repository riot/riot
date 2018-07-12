<bug-2609>
  <bug-2609-child if={cond1}>
    <div if={cond2}>
      <h1>{ message }</h1>
    </div>
  </bug-2609-child>

  <script>
    this.cond1 = true

    onClick() {
      var child = this.tags['bug-2609-child']

      this.cond1 = false
      this.update()

      child.update({
        cond2: true,
        message: Math.random()
      })
    }
  </script>
</bug-2609>

<bug-2609-child>
  <script>
    this.cond2 = false
    this.message = 'hello there'
  </script>
</bug-2609-child>