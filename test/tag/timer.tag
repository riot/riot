<timer>

  <p>Seconds Elapsed: { time }</p>

  this.time = opts.start || 0

  tick() {

    this.update({ time: ++this.time })

    if (this.opts.ontick) {
      this.opts.ontick(this.time)
    }

  }

  var timer = setInterval(this.tick, 1000)

  this.on('unmount', function() {

    clearInterval(timer)
  })

</timer>