const tmpl = `
  <div>
    <div ref="items" each="{ item in items }">
      { item.name }
      <p each="{ prop in item.props }">
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
        props: hasChildren ? generateItems(5, false) : []
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
      this.items = []
    })
    tag = riot.mount('loop-tag')[0]
  })
  .on('complete', function() {
    tag.unmount()
  })
  .add(testName, () => {
    tag.items = generateItems(10, true)
    tag.update()
    tag.items.splice(2, 1)
    tag.items.splice(4, 1)
    tag.items.splice(6, 1)
    tag.items.splice(9, 1)
    tag.items = tag.items.concat(generateItems(5, true))
    tag.update()
  })

}

