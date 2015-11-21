<treeview>

  <ul id='treeview'>
    <li>
      <treeitem data={ treedata }></treeitem>
    </li>
  </ul>

  <script>
  this.treedata = {
    name: 'My Tree',
    nodes: [
      { name: 'hello' },
      { name: 'wat' },
      {
        name: 'child folder',
        nodes: [
          {
            name: 'child folder',
            nodes: [
              { name: 'hello' },
              { name: 'wat' }
            ]
          },
          { name: 'hello' },
          { name: 'wat' },
          {
            name: 'child folder',
            nodes: [
              { name: 'hello' },
              { name: 'wat' }
            ]
          }
        ]
      }
    ]
  }
  </script>
</treeview>

<treeitem>

  <div class={ bold: isFolder() } onclick={ toggle } ondblclick={ changeType }>
    { name }
    <span if={ isFolder() }>[{open ? '-' : '+'}]</span>
  </div>

  <!-- TODO: now if is implemented as CSS display, so show must use isFolder as well, which should be removed -->

  <ul if={ isFolder() } show={ isFolder() && open }>
    <li each={ child, i in nodes }>
      <treeitem data={child}></treeitem>
    </li>
    <li onclick={ addChild }>+</li>
  </ul>

  <script>
  var self = this
  self.name = opts.data.name
  self.nodes = opts.data.nodes

  isFolder() {
    return self.nodes && self.nodes.length
  }

  toggle(e) {
    self.open = !self.open
  }

  changeType(e) {
    if (!self.isFolder()) {
      self.nodes = []
      self.addChild()
      self.open = true
    }
  }

  addChild(e) {
    self.nodes.push({
      name: 'new stuff'
    })
  }
  </script>
</treeitem>