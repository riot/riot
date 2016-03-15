const tmpl = `
  <div if="{ flag }">
    <p>{ msg }</p>
  </div>
`

module.exports = function(suite, testName, riot) {

  // setup
  var ifTag = document.createElement('if-tag')
  body.appendChild(ifTag)
  riot.tag('if-tag', tmpl,  function() {
    this.msg = 'hi'
    this.flag = false
  })

  suite.add(testName, () => {
    var tag = riot.mount('if-tag')[0]
    tag.update()
    tag.flag = true
    tag.update()
  })
}

