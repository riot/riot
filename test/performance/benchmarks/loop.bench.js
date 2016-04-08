const tmpl = `
  <div each="{ item in items }">
    { item.name }
    <p if="{ item.props }" each="{ prop in item.props }">
      { prop.name }
    </p>
  </div>
`

module.exports = function(suite, testName, riot) {
  function generateItems(amount, hasChildren) {
    var items = []
    while (amount--) {
      items.push({
        name: 'foo',
        props: hasChildren ? generateItems(10, false) : false
      })
    }
    return items
  }
  // setup
  var loopTag = document.createElement('loop-tag')
  body.appendChild(loopTag)
  riot.tag('loop-tag', tmpl, function() {
    this.items = generateItems(10, true)
  })

  suite.add(testName, () => {
    var tag = riot.mount('loop-tag')[0]
    tag.items.push(generateItems(10, true))
    tag.update()
  })

}

