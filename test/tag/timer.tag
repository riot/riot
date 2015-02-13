<timer>

  <p>Seconds Elapsed: { time }</p>

  this.time = opts.start || 0

  tick() {
    this.time++
  }

  var timer = setInterval(this.tick, 1000)

  this.on('unmount', function() {
    console.info('timer cleared')
    clearInterval(timer)
  })

</timer>