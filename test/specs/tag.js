describe('Tag', function() {
  it('top level attr manipulation', function() {
    var div = document.createElement('div')
    div.innerHTML = [
      '<top-level-attr value="initial"></top-level-attr>'
    ].join('\r')
    document.body.appendChild(div)

    riot.tag('top-level-attr', '{opts.value}')

    var tag = riot.mount('top-level-attr')[0]

    tag.root.setAttribute('value', 'changed')
    tag.update()

    expect(tag.root.innerHTML).to.be('changed')
  })

  it('top level attr manipulation having expression', function() {
    var div = document.createElement('div')
    div.innerHTML = [
      '<top-level-attr value="initial"></top-level-attr>'
    ].join('\r')
    document.body.appendChild(div)

    riot.tag('top-level-attr', '{opts.value}')

    var tag = riot.mount('top-level-attr')[0]

    tag.root.setAttribute('value', '{1+1}')
    tag.update()

    expect(tag.root.innerHTML).to.be('2')
  })
})
