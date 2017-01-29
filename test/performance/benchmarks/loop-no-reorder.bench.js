const tmpl = `
  <div>
    <div each="{ item in items }" no-reorder>
      { item.name }
      <p each="{ prop in item.props }" no-reorder>
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
        name: 'foo',
        props: hasChildren ? generateItems(5, false) : []
      })
    }
    return items
  }

  let tag
  suite
  .on('start', function() {
    var loopTag = document.createElement('loop-tag-no-reorder')
    body.appendChild(loopTag)
    riot.tag('loop-tag-no-reorder', tmpl, function() {
      this.items = []
    })
    tag = riot.mount('loop-tag-no-reorder')[0]
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

