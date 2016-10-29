<update-context>
  <p>{ message }</p>

  <script>
    this.message = 'hi'

    this.on('update', function() {
      this.message = 'goodbye'
    })

    setTimeout(this.update, 100)
  </script>
</update-context>