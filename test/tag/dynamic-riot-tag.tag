<color>
  <input type="color" name="{ opts.name }" />
</color>

<calendar>
  <input type="date" name="{ opts.name }" />
</calendar>

<dynamic-riot-tag>
  <div each={inp in intags } riot-tag={ inp.tag } inpname={ inp.name }></div>
  <div riot-tag={single}></div>

  this.intags = [
    {name: 'aaa', tag: 'color'},
    {name: 'bbb', tag: 'color'},
    {name: 'ccc', tag: 'calendar'}
  ]

  this.single = 'calendar'


</dynamic-riot-tag>