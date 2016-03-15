module.exports = function(suite, riot, body) {

  // setup
  var ifTag = document.createElement('mount-tag')
  body.appendChild(ifTag)
  riot.tag('mount-tag', '<p>{ msg }</p>', function() {
    this.msg = 'hi'
  })

  suite.add('riot#mount', () => {
    var tag = riot.mount('mount-tag')[0]
    tag.update()
  })
}

