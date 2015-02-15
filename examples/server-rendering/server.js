var fs = require('fs')
var express = require('express')
var riot = require('riot').install()

var timer = require('riot/test/tag/timer.tag')
var timetable = require('riot/test/tag/timetable.tag')

riot.tag(timer)
riot.tag(timetable)

var app = express()
app.engine('html', riot.renderFile)
app.use(express.static('public'))

app.get('/', function(req, res) {
  res.render('index.html', { start: 79 })
})

var server = app.listen(3000, function() {
  console.log('Riot server app listening at http://localhost:%s', server.address().port)
})
