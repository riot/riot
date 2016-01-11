
<form-controls>

  <label>
    <input type="checkbox" onclick={ check }> Click me
  </label>

  <select>
    <option value="all">All</option>
    <option selected value={ opts.text }>my-value</option>
  </select>

  <textarea>{ opts.text }</textarea>

  <label>
    <input type="radio" onclick={ check }> Click me
  </label>

  <form onsubmit={ check }>
    <input value={ opts.text } type="text">
  </form>

  check() {
    console.info('jooo')
  }

</form-controls>