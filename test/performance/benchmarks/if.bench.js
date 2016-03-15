const tmpl = `
  <div if="{ flag }">
    <p>{ msg }</p>
  </div>
`

module.exports = function(suite, riot, body) {

  // setup
  var ifTag = document.createElement('if-tag')
  body.appendChild(ifTag)
  riot.tag('if-tag', tmpl,  function() {
    this.msg = 'hi'
    this.flag = false
  })

  suite.add('riot#if', () => {
    var tag = riot.mount('if-tag')[0]
    tag.update()
    tag.flag = true
    tag.update()
  })
}

