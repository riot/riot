<plans>
  <h2>Plans</h2>
  <plan each=" { name in names } " name="{ name }"></plan>

  this.names = ['plan1', 'plan2'];

</plans>
<plan>
  <p>{ name }</p>

  this.name = opts.name
</plan>

<isloop-test>
  <h1>{ name }</h1>

  <plans></plans>

  this.name = 'Test'
</isloop-test>
