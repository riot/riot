<inner>
  <p>
    { opts.value }
  </p>
</inner>

<outer>
  <div each="{ data, i in opts.data }">
    <span>{ i }</span>
    <inner value="{ data.value }"></inner>
  </div>
</outer>