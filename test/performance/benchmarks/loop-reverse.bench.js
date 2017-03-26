const tmpl = `
  <div>
    <div ref="items" each="{ item in items }">
      { item.name }
      <p if="{ item.props }" each="{ prop in item.props }">
        { prop.name }
      </p>
    </div>
  </div>
`

module.exports = function(suite, testName, riot) {
  function generateItems(amount, hasChildren) {
    var items = []
    while (amount--) {
      items.push({
        name: `foo ${ Math.random() }`,
        props: hasChildren ? generateItems(10, false) : false
      })
    }
    return items
  }
  let tag
  suite
  .on('start', function() {
    // setup
    var loopTag = document.createElement('loop-tag')
    body.appendChild(loopTag)
    riot.tag('loop-tag', tmpl, function() {
      this.items = generateItems(10, true)
    })
    tag = riot.mount('loop-tag')[0]
  })
  .on('complete', function() {
    tag.unmount()
  })
  .add(testName, () => {
    tag.items.reverse()
    tag.update()
  })

}

