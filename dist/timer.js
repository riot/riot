
riot.tag('timer', '<span>Seconds Elapsed: { time }</span>', function(opts) {


  var self = this
  this.time = 0

  var timer = setInterval(function() {
    if (!self.set({ time: ++self.time })) clearInterval(timer)

  }, 1000)
})

