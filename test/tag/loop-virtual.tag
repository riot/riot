<loop-virtual>
  <virtual each={item in data}>
    <dt>{item.key}</dt>
    <dd>{item.value}</dd>
  </virtual>

  this.data = [
  { key: 'Coffee', value: 'Black hot drink' },
  { key: 'Milk', value: 'White cold drink' }
  ]

</loop-virtual>

<loop-virtual-reorder>
  <virtual each={item in data} reorder="true">
    <dt>{item.key}</dt>
    <dd>{item.value}</dd>
  </virtual>

  this.data = [
  { key: 'Coffee', value: 'Black hot drink' },
  { key: 'Milk', value: 'White cold drink' }
  ]

</loop-virtual-reorder>
