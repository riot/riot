
<event-error>

  <form onsubmit={ submit }>
    <input name="title">
    <button>Submit</button>
  </form>

  submit() {
    throw new Error('test');
  }

</event-error>