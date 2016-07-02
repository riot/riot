import { injectHTML } from '../../helpers/index'

const expect = chai.expect

describe('Mixin', function() {

  var IdMixin = {
    getId: function() {
      return this._riot_id
    }
  }

  class FunctMixin {
    init() {
      this.type = 'func'
    }
    get message() {
      return 'Initialized'
    }
  }

  class ChildMixin extends FunctMixin {}

  var OptsMixin = {
    getOpts: function() {
      return this.opts
    },

    setOpts: function(options, update) {
      this.opts = options

      if (!update) {
        this.update()
      }

      return this
    }
  }

  var MixinWithInit = {
    init: function() {
      this.message = 'initialized'
    },
    message: 'not yet'
  }

  var globalMixin = {
    init: function() {
      this.globalAttr = 'initialized'
    },
    getGlobal: function() {
      return 'global'
    }
  }

  var globalMixin2 = {
    init: function() {
      this.globalAttr2 = 'initialized2'
    },
    getGlobal2: function() {
      return 'global2'
    }
  }

  it('Will register a global mixin without name and mount a tag with global mixed-in attributes and methods', function() {
    riot.mixin(globalMixin)
    injectHTML('<my-mixin></my-mixin>')
    riot.tag('my-mixin', '<span>some tag</span>')

    var tag = riot.mount('my-mixin')[0]

    expect('initialized').to.be.equal(tag.globalAttr)
    expect('global').to.be.equal(tag.getGlobal())
    tag.unmount()
  })

  it('Will register multiple global mixin without name and mount a tag with global mixed-in attributes and methods', function() {
    riot.mixin(globalMixin)
    riot.mixin(globalMixin2)
    injectHTML('<my-mixin></my-mixin>')
    riot.tag('my-mixin', '<span>some tag</span>')

    var tag = riot.mount('my-mixin')[0]

    expect('initialized').to.be.equal(tag.globalAttr)
    expect('initialized2').to.be.equal(tag.globalAttr2)
    expect('global').to.be.equal(tag.getGlobal())
    expect('global2').to.be.equal(tag.getGlobal2())
    tag.unmount()
  })

  it('Will register a global mixin with name and mount a tag with global mixed-in attributes and methods', function() {
    riot.mixin('global', globalMixin, true)
    injectHTML('<my-mixin></my-mixin>')
    riot.tag('my-mixin', '<span>some tag</span>')

    var tag = riot.mount('my-mixin')[0]

    expect('initialized').to.be.equal(tag.globalAttr)
    expect('global').to.be.equal(tag.getGlobal())
    tag.unmount()
  })

  it('Will register multiple global mixin with name and mount a tag with global mixed-in attributes and methods', function() {
    riot.mixin('global', globalMixin, true)
    riot.mixin('global2', globalMixin2, true)
    injectHTML('<my-mixin></my-mixin>')
    riot.tag('my-mixin', '<span>some tag</span>')

    var tag = riot.mount('my-mixin')[0]

    expect('initialized').to.be.equal(tag.globalAttr)
    expect('initialized2').to.be.equal(tag.globalAttr2)
    expect('global').to.be.equal(tag.getGlobal())
    expect('global2').to.be.equal(tag.getGlobal2())
    tag.unmount()
  })

  it('Will mount a tag and provide mixed-in methods', function() {

    injectHTML('<my-mixin></my-mixin>')

    riot.tag('my-mixin', '<span>some tag</span>', function(opts) {
      this.mixin(IdMixin)
    })

    var tag = riot.mount('my-mixin')[0]

    expect(tag._riot_id).to.be.equal(tag.getId())
    tag.unmount()
  })

  it('Will mount a tag and provide mixed-in methods from an function constructor instance', function() {
    injectHTML('<my-mixin></my-mixin>')

    function RootMixin() {
      this.getRoot = function() {
        return this.root
      }
    }

    var rootmixin = new RootMixin()

    riot.tag('my-mixin', '<span>some tag</span>', function(opts) {
      this.mixin(rootmixin)
    })

    var tag = riot.mount('my-mixin')[0]

    expect(tag.root).to.be.equal(tag.getRoot())
    tag.unmount()
  })

  it('Will mount two tags, each having separate mix-in methods', function() {

    injectHTML([
      '<my-mixin2 id="one"></my-mixin2>',
      '<my-mixin2 id="two"></my-mixin2>'
    ])

    riot.tag('my-mixin2', '<span>some tag</span>', function(opts) {
      this.mixin(IdMixin)
    })

    var first = riot.mount('#one')[0],
      second = riot.mount('#two')[0]

    expect(first._riot_id).to.be.equal(first.getId())
    expect(second._riot_id).to.be.equal(second.getId())
    expect(first._riot_id).not.to.be.equal(second._riot_id)
    expect(first.getId()).not.to.be.equal(second.getId())
    first.unmount()
    second.unmount()
  })

  it('Will mount a tag with multiple mixins mixed-in', function() {
    injectHTML('<my-mixin></my-mixin>')

    riot.tag('my-mixin', '<span>some tag</span>', function(opts) {
      this.mixin(IdMixin, OptsMixin)
    })

    var tag = riot.mount('my-mixin')[0],
      newOpts = {
        'some': 'option',
        'value': Math.random()
      }

    expect(tag._riot_id).to.be.equal(tag.getId())
    expect(tag.opts).to.be.equal(tag.getOpts())
    tag.setOpts(newOpts)
    expect(tag.opts).to.be.equal(tag.getOpts())

    tag.unmount()
  })

  it('Will mount a parent tag with a mixin and a sub-tag wtih a mixin', function() {
    injectHTML('<my-mixin></my-mixin>')

    riot.tag('my-mixin', '<span>some tag</span><sub-mixin></sub-mixin>', function(opts) {
      this.mixin(IdMixin, OptsMixin)
    })

    riot.tag('sub-mixin', '<span>sub mixin</span>', function(opts) {
      this.mixin(IdMixin)
    })

    var tag = riot.mount('my-mixin')[0]

    expect(tag._riot_id).to.be.equal(tag.getId())
    expect(tag.tags['sub-mixin']).not.to.be.equal('undefined')
    expect(tag.tags['sub-mixin']._riot_id).to.be.equal(tag.tags['sub-mixin'].getId())
    expect(tag.getId()).not.to.be.equal(tag.tags['sub-mixin'].getId())
    tag.unmount()
  })

  it('use and initialize raw functions as mixin', function() {
    injectHTML('<my-mixin></my-mixin>')
    riot.tag('my-mixin', '<span>{ message }</span>', function() {
      this.mixin(FunctMixin)
    })
    var tag = riot.mount('my-mixin')[0]
    expect(tag.root.innerHTML).to.be.equal('<span>Initialized</span>')
    expect(tag.type).to.be.equal('func')
    tag.unmount()
  })

  it('binds this-reference to the tag object', function() {
    injectHTML('<my-mixin></my-mixin>')

    riot.tag('my-mixin', '<span>some tag { getId() }</span>', function(opts) {
      this.mixin(IdMixin)
    })

    var tag = riot.mount('my-mixin')[0]

    expect(tag.root.innerHTML).to.be.equal('<span>some tag ' + tag._riot_id + '</span>')
    tag.unmount()
  })

  it('initializes the mixin', function() {
    injectHTML('<my-mixin></my-mixin>')

    riot.tag('my-mixin', '<span>some tag</span>', function(opts) {
      this.mixin(MixinWithInit)
    })

    var tag = riot.mount('my-mixin')[0]

    expect(tag.message).to.be.equal('initialized')
    tag.unmount()
  })

  it('register a mixin to Riot and load mixin to a tag', function() {
    injectHTML('<my-mixin></my-mixin>')

    riot.mixin('idMixin', IdMixin) // register mixin
    riot.tag('my-mixin', '<span>some tag</span>', function(opts) {
      this.mixin('idMixin') // load mixin
    })

    var tag = riot.mount('my-mixin')[0]

    expect(tag._riot_id).to.be.equal(tag.getId())
    tag.unmount()
  })

  it('register a function mixin to Riot and load mixin to a tag', function() {
    injectHTML('<my-mixin></my-mixin>')

    riot.mixin('functMixin', FunctMixin) // register mixin
    riot.tag('my-mixin', '<span>some tag</span>', function(opts) {
      this.mixin('functMixin') // load mixin
    })

    var tag = riot.mount('my-mixin')[0]
    expect(tag.type).to.be.equal('func')
    tag.unmount()
  })

  it('register a child function mixin to Riot and load mixin to a tag', function() {
    injectHTML('<my-mixin></my-mixin>')

    riot.mixin('childMixin', ChildMixin) // register mixin
    riot.tag('my-mixin', '<span>some tag</span>', function(opts) {
      this.mixin('childMixin') // load mixin
    })

    var tag = riot.mount('my-mixin')[0]
    expect(tag.type).to.be.equal('func')
    tag.unmount()
  })
})
