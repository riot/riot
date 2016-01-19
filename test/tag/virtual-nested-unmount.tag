<virtual-nested-unmount>
  <virtual each="{childItems}"><div>{title}</div>
    <virtual each="{value in childchildItems}">
      <span>{value}</span>
    </virtual>
    <br>
  </virtual>
  <button onclick="{ updateChildren }">updateChildren</button>
  self = this;

  self.childItems = [
    {title:"1", childchildItems: ['1']},
    {title:"2", childchildItems: ['1','2']},
    {title:"3", childchildItems: ['1','2','3']}
  ]

  self.childItems
</virtual-nested-unmount>
