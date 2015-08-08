<observable-attr>
  <observable-attr-child store={ store }></observable-attr-child>
  this.store = riot.observable()
  this.on('mount', function() {
    this.store.trigger('custom-event')
  })
</observable-attr>

<observable-attr-child>
  var self = this
  this.store = opts.store
  this.store.on('custom-event', function(){
    self.wasTriggered = true
  })
</observable-attr-child>
