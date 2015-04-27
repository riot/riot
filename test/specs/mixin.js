describe('Mixin', function() {

  var IdMixin = {
    getId: function() {
      return this._id
    }
  }

  var OptsMixin = {
    getOpts: function() {
      return this.opts
    },

    setOpts: function(options, update) {
      this.opts = options

      if(!update) {
        this.update()
      }

      return this
    }
  }

  it('Will mount a tag and provide mixed-in methods', function() {
    var mix = document.createElement('my-mixin')
    document.body.appendChild(mix)

    riot.tag('my-mixin', '<span>some tag</span>', function(opts) {
      this.mixin(IdMixin)
    })

    var tag = riot.mount('my-mixin')[0]

    expect(tag._id).to.be(tag.getId())
    tag.unmount()
  })

  it('Will mount two tags, each having separate mix-in methods', function() {
    var one = document.createElement('my-mixin2'),
        two = document.createElement('my-mixin2')

    one.setAttribute('id', 'one')
    two.setAttribute('id', 'two')
    document.body.appendChild(one)
    document.body.appendChild(two)

    riot.tag('my-mixin2', '<span>some tag</span>', function(opts) {
      this.mixin(IdMixin)
    })

    var first = riot.mount('#one')[0],
       second = riot.mount('#two')[0]

    expect(first._id).to.be(first.getId())
    expect(second._id).to.be(second.getId())
    expect(first._id).not.to.be(second._id)
    expect(first.getId()).not.to.be(second.getId())
    first.unmount()
    second.unmount()
  })

  it('Will mount a tag with multiple mixins mixed-in', function() {
    var mix = document.createElement('my-mixin')
    document.body.appendChild(mix)

    riot.tag('my-mixin', '<span>some tag</span>', function(opts) {
      this.mixin(IdMixin, OptsMixin)
    })

    var tag = riot.mount('my-mixin')[0],
      newOpts = {'some': 'option', 'value': Math.random()}

    expect(tag._id).to.be(tag.getId())
    expect(tag.opts).to.be(tag.getOpts())
    tag.setOpts(newOpts)
    expect(tag.opts).to.be(tag.getOpts())

    tag.unmount()
  })

  it('Will mount a parent tag with a mixin and a sub-tag wtih a mixin', function() {
    var mix = document.createElement('my-mixin')
    document.body.appendChild(mix)
    
    riot.tag('my-mixin', '<span>some tag</span><sub-mixin></sub-mixin>', function(opts) {
      this.mixin(IdMixin, OptsMixin)
    })
    
    riot.tag('sub-mixin', '<span>sub mixin</span>', function(opts) {
      this.mixin(IdMixin)
    })

    var tag = riot.mount('my-mixin')[0]

    expect(tag._id).to.be(tag.getId())
    expect(tag.tags['sub-mixin']).not.to.be('undefined')
    expect(tag.tags['sub-mixin']._id).to.be(tag.tags['sub-mixin'].getId())
    expect(tag.getId()).not.to.be(tag.tags['sub-mixin'].getId())
    tag.unmount()
  })

})