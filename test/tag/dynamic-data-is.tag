<color>
  <input type="color" name="{ opts.name }" />
</color>

<calendar>
  <input type="date" name="{ opts.name }" />
</calendar>

<dynamic-data-is>
  <div each={inp in intags } data-is={ inp.tag } inpname={ inp.name }></div>
  <div data-is={single}></div>

  this.intags = [
    {name: 'aaa', tag: 'color'},
    {name: 'bbb', tag: 'color'},
    {name: 'ccc', tag: 'calendar'}
  ]

  this.single = 'calendar'


</dynamic-data-is>
