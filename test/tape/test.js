var riot = require('riot').install()

riot.doc('<timetable><timer start="10"></timer><timer></timer><timer start="30"></timer></timetable>')

require('riot/test/tag/timer.tag')
riot.mountTo(riot.settings.doc.body.firstChild, 'timer', { start: 79 })
riot.mount('*', { start: 79 })

var res = riot.render()
console.log(res)
