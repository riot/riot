<outer-inner>
  <p>
    { opts.value }
  </p>
</outer-inner>

<outer>
  <div each="{ data, i in opts.data }">
    <span>{ i }</span>
    <outer-inner value="{ data.value }"></outer-inner>
  </div>
</outer>