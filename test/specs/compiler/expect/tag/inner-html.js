
riot.tag('inner-content', '', function(opts) {
  var p = this.parent.root

  while (p.firstChild) {
    if (this.root == p.firstChild) return
    this.root.appendChild(p.firstChild)
  }

});

riot.tag('inner-html', '<h1>Hello,</h1> <inner-content></inner-content>', function(opts) {

});