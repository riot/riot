//src: treeview.tag
riot.tag2('treeview', '<ul id="treeview"> <li> <treeitem data="{treedata}"></treeitem> </li> </ul>', '', '', function(opts) {
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
}, '{ }');

riot.tag2('treeitem', '<div class="{bold: isFolder()}" onclick="{toggle}" ondblclick="{changeType}"> {name} <span if="{isFolder()}">[{open ? \'-\' : \'+\'}]</span> </div> <ul if="{isFolder()}" show="{isFolder() && open}"> <li each="{child, i in nodes}"> <treeitem data="{child}"></treeitem> </li> <li onclick="{addChild}">+</li> </ul>', '', '', function(opts) {
  var self = this
  self.name = opts.data.name
  self.nodes = opts.data.nodes

  this.isFolder = function() {
    return self.nodes && self.nodes.length
  }.bind(this)

  this.toggle = function(e) {
    self.open = !self.open
  }.bind(this)

  this.changeType = function(e) {
    if (!self.isFolder()) {
      self.nodes = []
      self.addChild()
      self.open = true
    }
  }.bind(this)

  this.addChild = function(e) {
    self.nodes.push({
      name: 'new stuff'
    })
  }.bind(this)
}, '{ }');