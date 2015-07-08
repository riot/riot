<deferred-child-2>
  <p>I am the deferred-child-2</p>

  this.on('mount', function() {
    opts.onmount('deferred-child-2', this)
  })
</deferred-child-2>

<deferred-loop>
  <p>I am the deferred-loop</p>

  this.on('mount', function() {
    opts.onmount('deferred-loop', this)
  })
</deferred-loop>

<deferred-child-1>
  <p>I am the deferred-child-1</p>
  <deferred-child-2 onmount={ opts.onmount }></deferred-child-2>
  <deferred-loop onmount={ parent.opts.onmount } each={ items }></deferred-loop>

  this.items = [{},{},{},{},{}]

  this.on('mount', function() {
    opts.onmount('deferred-child-1', this)
  })
</deferred-child-1>

<deferred-mount>
  <p>I am the parent</p>
  <deferred-child-1 onmount={ opts.onmount }></deferred-child-1>

  this.on('mount', function() {
    opts.onmount('deferred-mount', this)
  })
</deferred-mount>