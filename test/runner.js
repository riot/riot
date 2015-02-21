
var isNode = typeof window === 'undefined'

describe('Riotjs tests',function() {
  if (isNode) {

    global.document = require('jsdom').jsdom('<!doctype html><html><body></body></html>')
    global.window = document.parentWindow
    global.location = window.location
    global.top = window

    require('shelljs/global')
    global.riot = require('../dist/riot/riot')
    global.compiler = require('../lib/compiler')
    global.expect = require('expect.js')

    require('./specs/compiler-cli') // TODO: fix some tests
    //require('./specs/compiler-browser')
    require('./specs/tmpl')
    require('./specs/observable')
    require('./specs/route')

  } else {
    mocha.run()
  }
})