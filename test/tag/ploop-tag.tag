
<ploop-tag>
  <div each="{ opts.elements }">
      <ploop-child foo="{ foo }" name="child-{ this.id }"></ploop-child>
  </div>
</ploop-tag>

<ploop-child>
  <p>{ opts.foo }</p>
</ploop-child>

