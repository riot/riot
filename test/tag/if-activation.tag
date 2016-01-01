<if-activation-tag>
  <h3>my-tag</h3>
  <if-activation if={ok}></if-activation>

  var self = this
  this.ok = false
  this.ifActive = false
  this.ifMounted = false
  this.ifUpdated = false
</if-activation-tag>

<if-activation>
  <if-child></if-child>
  this.parent.ifActive = true

  this.on('mount', function() {
    this.parent.ifMounted = true
  })

  this.on('update', function() {
    this.parent.ifUpdated = true
  })
</if-activation>

<if-child>

</if-child>
