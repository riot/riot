
<inner-content>
  var p = this.parent.root

  while (p.firstChild) {
    if (this.root == p.firstChild) return
    this.root.appendChild(p.firstChild)
  }
</inner-content>

<inner-html>
  <h1>Hello,</h1>
  <inner-content/>
</inner-html>