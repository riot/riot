<ploop-tag>
    <ploop-child each="{ opts.elements }" foo="{ foo }" name="child-{ this.id }"></ploop-child>
</ploop-tag>

<ploop1-tag>
  <div each="{ opts.elements }">
    <ploop-child foo="{ foo }" name="child-{ this.id }"></ploop-child>
  </div>
</ploop1-tag>

<ploop2-tag>
  <div each="{ opts.elements }">
    <div>
      <ploop-child foo="{ foo }" name="child-{ this.id }"></ploop-child>
    </div>
  </div>
</ploop2-tag>

<ploop3-tag>
  <div each="{ opts.elements }">
    <div>
      <div>
        <ploop-child foo="{ foo }" name="child-{ this.id }"></ploop-child>
      </div>
    </div>
  </div>
</ploop3-tag>

<ploop-child>
  <p>{ opts.foo }</p>
</ploop-child>
