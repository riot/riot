<prevent-update>
  <p onclick={ changeNameSilently }>click me</p>
  <p id="fancy-name">{ name }</p>

  this.name = 'john'
  changeNameSilently(e) {
    e.preventUpdate = true
    this.name = 'mark'
  }
</prevent-update>