var riot = require('../lib').install()
var timer = require('./tag/timer.tag')
var timetable = require('./tag/timetable.tag')

riot.doc(
  '<timer></timer>',
  '<timetable></timetable>'
)

riot.tag(timer)
riot.tag(timetable)

riot.mount('*', { start: 79 })

var res = riot.render()
console.log(res)
