describe('Speed', function() {

  var tag

  before(function() {
    document.body.appendChild(document.createElement('my-tag'))
  })

  after(function() {
    tag.unmount()
  })

  it('it must render a list of 2000 items in less than a second', function() {
    var time,
        renderingTime = 1000 // this must be a looooot faster
    // this is going to be slow
    riot.tag('my-tag', '<div> <h1><button onclick="{ clicked }">reverse list</button></h1> <h2 each="{ item, i in opts.items }" id="{ first-item: i === 0 }">{ item.value }</h2> </div>', function(opts) {
      var self = this
      this.items = opts.items

      this.clicked = function() {
        var start = new Date().getTime()
        self.update({
          items: self.items.reverse()
        })
        time = new Date().getTime() - start
      }

    })

    // mount the tag
    var items = []

    for ( var i = 0; i < 2000; i++ ) {
      items.push( { value: i } )
    }

    tag = riot.mount('my-tag', { items: items } )[0]
    expect(~~document.getElementById('first-item').innerHTML).to.be(0)

    tag.clicked()
    expect(time).to.be.below(renderingTime)
    expect(~~document.getElementById('first-item').innerHTML).to.be(1999)

  })

})
