const tmpl = `
  <div each="{ item in items }" no-reorder>
    { item.name }
    <p if="{ item.props }" each="{ prop in item.props }" no-reorder>
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
  var loopTag = document.createElement('loop-tag-no-reorder')
  body.appendChild(loopTag)
  riot.tag('loop-tag-no-reorder', tmpl, function() {
    this.items = generateItems(10, true)
  })

  suite.add(testName, () => {
    var tag = riot.mount('loop-tag-no-reorder')[0]
    tag.items.push(generateItems(10, true))
    tag.update()
  })

}

