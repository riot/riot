riot.tag2('treeitems', '<treeitem> <div class="{bold: isFolder()}" onclick="{toggle}" ondblclick="{changeType}"> {name} <span if="{isFolder()}">[{open ? \'-\' : \'+\'}]</span> </div> <ul if="{isFolder()}" show="{isFolder() && open}"> <li each="{child, i in nodes}"> <treeitem data="{child}"></treeitem> </li> <li onclick="{addChild}">+</li> </ul> </treeitem>', '', '', function(opts) {

    var self = this
}, '{ }');