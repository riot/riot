<color>
  <input type="color" name="{ opts.inpname }" />
</color>

<calendar>
  <input type="date" name="{ opts.inpname }" />
</calendar>

<dynamic-data-toggle>
  <p>foo</p>
</dynamic-data-toggle>

<dynamic-data-is>
  <div each={ inp in intags } data-is={ inp.tag } inpname={ inp.name }></div>
  <div data-is={ single } inpname={ single }></div>
  <div data-is={ toggleTag } if={ toggle }></div>

  this.intags = [
    {name: 'aaa', tag: 'color'},
    {name: 'bbb', tag: 'color'},
    {name: 'ccc', tag: 'calendar'}
  ]

  this.toggle = true
  this.toggleTag = 'dynamic-data-toggle'

  this.single = 'calendar'
</dynamic-data-is>
