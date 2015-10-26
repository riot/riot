/**
 *
 * You can check the live example on here http://jsfiddle.net/gianlucaguarini/ftoLgfg3/
 *
 */

var riot = require('../../dist/riot/riot'),
  oldRiot = require('../../riot'),
  Benchmark = require('benchmark'),
  suite = new Benchmark.Suite(),
  jsdom = require('jsdom').jsdom,
  data = {
    title: 'hello world',
    description: 'mad world',
    items: generateItems(100, {
      isActive: false
    })
  },
  myComponent1 = 'my-component-1',
  myComponent2 = 'my-component-2',
  myComponentHTML = `
    <h1>{ opts.title }</h1>
    <p>{ opts.description }</p>
    <my-list-item each="{ items }">
  `,
  myListItem = 'my-list-item',
  myListItemHTML = `
    <input type="checkbox" onchange="{ onChange }">
    <span if="{ opts.isActive }">I am active</span>
  `


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
 *
 * Adding the custom tags to the riot internal cache
 *
 */

function setupTags(riot, component) {
  riot.tag(myListItem, myListItemHTML, function () {
    this.onChange = function () {
      opts.isActive = e.target.checked
    }
  })

  riot.tag(component, myComponentHTML, function(opts) {

    this.items = generateItems(100, {
      isActive: false
    })

  })

}

// Initialize the test
var doc = jsdom(`<${myComponent1}/> <${myComponent2}/>`)
global.window = doc.defaultView
global.document = window.document

setupTags(oldRiot, myComponent2)
setupTags(riot, myComponent1)

suite
.add('old riot', function() {
  var tag = oldRiot.mount(myComponent2, data)[0]
  tag.items.reverse()
  tag.update()
  tag.items.reverse()
  tag.update()
  tag.items.reverse()
  tag.update()
}, {
  teardown: function() {
    global.gc()
  }
})
.add('new riot', function() {
  var tag = riot.mount(myComponent1, data)[0]
  tag.items.reverse()
  tag.update()
  tag.items.reverse()
  tag.update()
  tag.items.reverse()
  tag.update()
}, {
  teardown: function() {
    global.gc()
  }
})
.on('cycle', function(event) {
  console.log(String(event.target))
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'))
})
.run({'async': false, 'queued': true})

