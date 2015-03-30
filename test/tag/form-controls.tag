
<form-controls>

  <label>
    <input type="checkbox" onclick={ check }> Click me
  </label>

  <label>
    <input type="radio" onclick={ check }> Click me
  </label>

  <form onsubmit={ check }>
    <input type="text">
  </form>

  check() {
    console.info('jooo')
  }

</form-controls>