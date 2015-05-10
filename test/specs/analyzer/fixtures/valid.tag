var riot = require('riot')

<valid-tag>
  <h1>{ title }</h1>
  <p>{ message }</p>

  this.title = 'Hello world!'
  this.message = 'I am hungry...'
</valid-tag>

<tag-with-style>
  <p>Hi!</p>
  <style scoped>
    p { color: red }
  </style>
</tag-with-style>

<tag-with-script>
  <h1>{ title }</h1>
  <p>{ message }</p>
  <script>
    this.title = 'Hello world!'
    this.message = 'I am hungry...'
  </script>
</tag-with-script>

console.log('end of file')
