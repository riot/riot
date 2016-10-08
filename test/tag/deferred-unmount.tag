<deferred-unmount>
  <p>Defer me</p>

  this.beforeUnmountCalled = false;
  this.beforeUnmount = function(cb){
    this.beforeUnmountCalled = true;
    setTimeout(function(){
      cb();
    }.bind(this), 10);
  }
</deferred-unmount>
