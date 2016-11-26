<input-updated>
  <h3>{ message }</h3>
  <input ref="i" value="{ message }">
  <button ref="b" onclick={ setOtherValue }>Click me!</button>
  <script>
    this.message = 'Hello, Riot!'
    setOtherValue () {
      this.message = 'Can you hear me?'
    }
  </script>
</input-updated>
