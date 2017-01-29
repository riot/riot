const tmpl = `
  <div>
    <div if="{ flag }">
      <p>{ msg }</p>
    </div>
  </div>
`

module.exports = function(suite, testName, riot) {
  let tag
  suite
  .on('start', function() {
    var ifTag = document.createElement('if-tag')
    body.appendChild(ifTag)
    riot.tag('if-tag', tmpl,  function() {
      this.msg = 'hi'
      this.flag = false
    })
    tag = riot.mount('if-tag')[0]
  })
  .on('complete', function() {
    tag.unmount()
  })
  .add(testName, () => {
    tag.flag = true
    tag.update()
    tag.flag = false
    tag.update()
  })
}

