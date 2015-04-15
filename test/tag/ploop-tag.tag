<ploop-tag>
    <ploop-child each="{ opts.elements }" foo="{ foo }" name="child-{ this.id }"></ploop-child>
    <ploop-another foo="test"></ploop-another>
</ploop-tag>

<ploop1-tag>
  <div each="{ opts.elements }">
    <ploop-child foo="{ foo }" name="child-{ this.id }"></ploop-child>
  </div>
  <ploop-another foo="test"></ploop-another>
  <ploop-another foo="test"></ploop-another>
</ploop1-tag>

<ploop2-tag>
  <div each="{ opts.elements }">
    <div>
      <ploop-child foo="{ foo }" name="child-{ this.id }"></ploop-child>
    </div>
  </div>
  <ploop-another foo="test"></ploop-another>
</ploop2-tag>

<ploop3-tag>
  <div each="{ opts.elements }">
    <div>
      <div>
        <ploop-child foo="{ foo }" name="child-{ this.id }"></ploop-child>
      </div>
    </div>
  </div>
  <ploop-another foo="test"></ploop-another>
</ploop3-tag>

<ploop-child>
  <p>{ opts.foo }</p>
</ploop-child>
<ploop-another>
  <p>{ opts.foo }</p>
</ploop-another>
