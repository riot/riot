
<loop-protect-internal-attrs>

  <div each={ items }>
    <loop-protect-internal-attrs-child></loop-protect-internal-attrs-child>
  </div>

  this.items = [
    { foo: 'foo', tags: 'tags' },
    { foo: 'foo', tags: 'tags' },
    { foo: 'foo', tags: 'tags' },
    { foo: 'foo', tags: 'tags' }
  ]

</loop-protect-internal-attrs>

<loop-protect-internal-attrs-child></loop-protect-internal-attrs-child>