import { injectHTML } from '../../../helpers/index'

describe('Mixin', function() {

  const IdMixin = {
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

  const OptsMixin = {
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

  const MixinWithInit = {
    init: function() {
      this.message = 'initialized'
    },
    message: 'not yet'
  }

  const globalMixin = {
    init: function() {
      this.__globalAttr__ = 'initialized'
      this.__optsKeys__ = Object.keys(this.opts)
    },
    __getGlobal__: function() {
      return 'global'
    }
  }

  const globalMixin2 = {
    init: function() {
      this.__globalAttr2__ = 'initialized2'
    },
    __getGlobal2__: function() {
      return 'global2'
    }
  }

  const getterSetterMixin = {
    _value: false
  }

  Object.defineProperty(getterSetterMixin, 'value', {
    get: function() {
      return this._value
    },
    set: function(value) {
      this._value = value
    }
  })

  it('Will register a mixin with getter/setter functions', function() {
    injectHTML('<my-mixin></my-mixin>')
    riot.tag('my-mixin', '<span>some tag</span>')

    var tag = riot.mount('my-mixin')[0]

    tag.mixin(getterSetterMixin)

    tag.value = true

    expect(true).to.be.equal(tag._value)
    expect(true).to.be.equal(tag.value)

    tag.unmount()
  })

  it('Will register a mixin whose prototype has getter/setter functions', function() {
    injectHTML('<my-mixin></my-mixin>')
    riot.tag('my-mixin', '<span>some tag</span>')

    var tag = riot.mount('my-mixin')[0]

    var mixinInstance = Object.create(getterSetterMixin)

    tag.mixin(mixinInstance)

    tag.value = true

    expect(true).to.be.equal(tag._value)
    expect(true).to.be.equal(tag.value)

    tag.unmount()
  })

  it('Will register a global mixin without name and mount a tag with global mixed-in attributes and methods', function() {
    riot.mixin(globalMixin)
    injectHTML('<my-mixin></my-mixin>')
    riot.tag('my-mixin', '<span>some tag</span>')

    var tag = riot.mount('my-mixin')[0]

    expect('initialized').to.be.equal(tag.__globalAttr__)
    expect('global').to.be.equal(tag.__getGlobal__())
    tag.unmount()
  })

  it('Will register multiple global mixin without name and mount a tag with global mixed-in attributes and methods', function() {
    riot.mixin(globalMixin)
    riot.mixin(globalMixin2)
    injectHTML('<my-mixin></my-mixin>')
    riot.tag('my-mixin', '<span>some tag</span>')

    var tag = riot.mount('my-mixin')[0]

    expect('initialized').to.be.equal(tag.__globalAttr__)
    expect('initialized2').to.be.equal(tag.__globalAttr2__)
    expect('global').to.be.equal(tag.__getGlobal__())
    expect('global2').to.be.equal(tag.__getGlobal2__())
    tag.unmount()
  })

  it('Will register a global mixin with name and mount a tag with global mixed-in attributes and methods', function() {
    riot.mixin('global', globalMixin, true)
    injectHTML('<my-mixin></my-mixin>')
    riot.tag('my-mixin', '<span>some tag</span>')

    var tag = riot.mount('my-mixin')[0]

    expect('initialized').to.be.equal(tag.__globalAttr__)
    expect('global').to.be.equal(tag.__getGlobal__())
    tag.unmount()
  })

  it('Will register multiple global mixin with name and mount a tag with global mixed-in attributes and methods', function() {
    riot.mixin('global', globalMixin, true)
    riot.mixin('global2', globalMixin2, true)
    injectHTML('<my-mixin></my-mixin>')
    riot.tag('my-mixin', '<span>some tag</span>')

    var tag = riot.mount('my-mixin')[0]

    expect('initialized').to.be.equal(tag.__globalAttr__)
    expect('initialized2').to.be.equal(tag.__globalAttr2__)
    expect('global').to.be.equal(tag.__getGlobal__())
    expect('global2').to.be.equal(tag.__getGlobal2__())
    tag.unmount()
  })

  it('Will mount a tag and provide mixed-in methods', function() {

    injectHTML('<my-mixin></my-mixin>')

    riot.tag('my-mixin', '<span>some tag</span>', function() {
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

    riot.tag('my-mixin', '<span>some tag</span>', function() {
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

    riot.tag('my-mixin2', '<span>some tag</span>', function() {
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

  it('Options should be available also in the "init" method', function() {
    injectHTML('<my-mixin baz="baz"></my-mixin>')

    riot.tag('my-mixin', '<p>foo</p>')

    const tag = riot.mount('my-mixin', { foo: 'foo', bar: 'bar'})[0]

    expect(tag.__optsKeys__).to.be.deep.equal(['foo', 'bar', 'baz'])
    tag.unmount()
  })

  it('Will mount a tag with multiple mixins mixed-in', function() {
    injectHTML('<my-mixin></my-mixin>')

    riot.tag('my-mixin', '<span>some tag</span>', function() {
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

    riot.tag('my-mixin', '<span>some tag</span><sub-mixin></sub-mixin>', function() {
      this.mixin(IdMixin, OptsMixin)
    })

    riot.tag('sub-mixin', '<span>sub mixin</span>', function() {
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

    riot.tag('my-mixin', '<span>some tag { getId() }</span>', function() {
      this.mixin(IdMixin)
    })

    var tag = riot.mount('my-mixin')[0]

    expect(tag.root.innerHTML).to.be.equal('<span>some tag ' + tag._riot_id + '</span>')
    tag.unmount()
  })

  it('initializes the mixin', function() {
    injectHTML('<my-mixin></my-mixin>')

    riot.tag('my-mixin', '<span>some tag</span>', function() {
      this.mixin(MixinWithInit)
    })

    var tag = riot.mount('my-mixin')[0]

    expect(tag.message).to.be.equal('initialized')
    tag.unmount()
  })

  it('register a mixin to Riot and load mixin to a tag', function() {
    injectHTML('<my-mixin></my-mixin>')

    riot.mixin('idMixin', IdMixin) // register mixin
    riot.tag('my-mixin', '<span>some tag</span>', function() {
      this.mixin('idMixin') // load mixin
    })

    var tag = riot.mount('my-mixin')[0]

    expect(tag._riot_id).to.be.equal(tag.getId())
    tag.unmount()
  })

  it('register a function mixin to Riot and load mixin to a tag', function() {
    injectHTML('<my-mixin></my-mixin>')

    riot.mixin('functMixin', FunctMixin) // register mixin
    riot.tag('my-mixin', '<span>some tag</span>', function() {
      this.mixin('functMixin') // load mixin
    })

    var tag = riot.mount('my-mixin')[0]
    expect(tag.type).to.be.equal('func')
    tag.unmount()
  })

  it('register a child function mixin to Riot and load mixin to a tag', function() {
    injectHTML('<my-mixin></my-mixin>')

    riot.mixin('childMixin', ChildMixin) // register mixin
    riot.tag('my-mixin', '<span>some tag</span>', function() {
      this.mixin('childMixin') // load mixin
    })

    var tag = riot.mount('my-mixin')[0]
    expect(tag.type).to.be.equal('func')
    tag.unmount()
  })

  it('class mixins don\'t destroy the tag classes __proto__', function(done) {
    class ClassTag extends riot.Tag {
      // mandatory in order to use and identify this component
      get name() {
        return 'class-tag'
      }
      get tmpl() {
        return '<p onclick="{someclickfunction}">hi { message }</p>'
      }
      get attrs() {
        return ''
      }
      get css() {
        return ''
      }
      onCreate() {
        this.mixin(FunctMixin)
        expect(this.someclickfunction).to.be.a('function')
        done()
      }
      someclickfunction() {
        this.message = 'goodbye'
      }
    }
    new ClassTag(document.createElement('div'))
  })

  it('Unregistered mixins will throw an error', function() {
    expect(riot.mixin).to.throw(Error)
  })

  it('riot mixins should receive the riot options via init method', function(done) {
    injectHTML('<my-mixin></my-mixin>')

    riot.mixin('init-with-opts', {
      init(opts) {
        expect(opts).to.be.not.undefined
        done()
      }
    }) // register mixin
    riot.tag('my-mixin', '<span>some tag</span>', function() {
      this.mixin('init-with-opts') // load mixin
    })

    var tag = riot.mount('my-mixin')[0]
    tag.unmount()
  })
})
