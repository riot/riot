module.exports = function(suite, testName, riot) {

  // setup
  var ifTag = document.createElement('mount-tag')
  body.appendChild(ifTag)
  riot.tag('mount-tag', '<p>{ msg }</p>', function() {
    this.msg = 'hi'
  })

  suite.add(testName, () => {
    var tag = riot.mount('mount-tag')[0]
    tag.update()
  })
}

