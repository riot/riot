
<event-error>

  <form onsubmit={ submit }>
    <input name="title">
    <button>Submit</button>
  </form>

  submit(e) {
    e.preventDefault()
    throw new Error('event-error test');
  }

</event-error>
