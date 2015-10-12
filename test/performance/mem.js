/**
 *
 * You can check the live example on here http://jsfiddle.net/gianlucaguarini/ftoLgfg3/
 *
 */

var riot = require('../../dist/riot/riot'),
  jsdom = require('jsdom').jsdom,
  myComponent = 'my-component',
  myComponentHTML = [
    '<h1>{ opts.title }</h1>',
    '<p>{ opts.description }</p>',
    '<my-list-item each="{ opts.items }">'
  ].join(''),
  myListItem = 'my-list-item',
  myListItemHTML = [
    '<input type="checkbox" onchange="{ onChange }">',
    '<span if="{ opts.isActive }">I am active</span>'
  ].join('')


/**
 * Helper function to generate custom array
 * @param  { int } amount amount of entries in the array
 * @param  { * } data
 * @return array
 */


function generateItems (amount) {
  var items = []
  while (--amount) {
    items.push({
      isActive: false
    })
  }
  return items
}

/**
 * Check the memory usage analizing the heap
 * @param  { function } fn
 * @return { array } memory used + duration
 */

function measure(fn) {
  var startTime = Date.now()
  fn()
  return [process.memoryUsage().heapUsed, Date.now() - startTime]
}

/**
 *
 * Adding the custom tags to the riot internal cache
 *
 */

function setupTags() {
  riot.tag(myComponent, myComponentHTML, function(opts) {
    var self = this
    function loop () {
      opts.items = generateItems(1000, {
        isActive: false
      })
      result = measure(self.update.bind(self))
      console.log(
        (result[0] / 1024 / 1024).toFixed(2) + ' MiB',
        result[1] + ' ms'
      )
      setTimeout(loop, 1000)
    }
    loop()
  })
  riot.tag(myListItem, myListItemHTML, function () {
    this.onChange = function () {
      opts.isActive = e.target.checked
    }
  })
}

/**
 *
 * Mount the custom tags passing some fake values
 *
 */

function mount() {
  riot.mount(myComponent, {
    title: 'hello world',
    description: 'mad world',
    items: generateItems(1000, {
      isActive: false
    })
  })
}


// Initialize the test
var doc = jsdom('<' + myComponent + '/>')
global.window = doc.defaultView
global.document = window.document
global.gc()
setupTags()
mount()

