<async-rendering>
  <p>{ message }</p>

  <script>
    var self = this
    this.message = ''

    setTimeout(function() {
      self.message = 'hi'
      self.update()
      self.trigger('ready')
    }, opts.delay || 500)

  </script>
</async-rendering>