<each-start-end>
  <dl>
    <dt>static title</dt>
    <dd>static def</dd>
    <dt each-start={def in defs}>{def.title}</dt>
    <dd each-end>{def.def}</dd>
  </dl>

  this.defs = [
    {title: 'title 1', def: 'def 1'},
    {title: 'title 2', def: 'def 2'}
  ]
</each-start-end>
