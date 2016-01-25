<color>
  <input type="color" name="{ opts.name }" />
</color>

<calendar>
  <input type="date" name="{ opts.name }" />
</calendar>

<dynamic-riot-tag>
  <div each={inp in intags } riot-tag={ inp.tag } inpname={ inp.name }></div>
  <div riot-tag={intags[2].tag}></div>

  this.intags = [
  {name: 'aaa', tag: 'color'},
  {name: 'bbb', tag: 'color'},
  {name: 'ccc', tag: 'calendar'}
  ]


</dynamic-riot-tag>
