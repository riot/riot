<ploop-tag>
  <div each="{ opts.elements }">
    <div><ploop-child foo="{ foo }" name="child-{ this.id }"></ploop-child></div>
  </div>
</ploop-tag>

<ploop-child>
  <p>{ opts.foo }</p>
</ploop-child>
