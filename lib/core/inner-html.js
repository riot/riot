riot.tag('inner-html', '', function() {
    var p = this.parent.root
    while (p.firstChild) this.root.appendChild(p.firstChild)
})
