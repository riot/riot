
function Tag(impl, conf) {

  var self = riot.observable(this),
      expressions = [],
      attributes = {},
      parent = conf.parent,
      is_loop = conf.loop,
      root = conf.root,
      opts = inherit(conf.opts) || {},
      item = conf.item

  // cannot initialize twice on the same root element
  if (!is_loop && root.riot) return
  root.riot = 1

  extend(this, { parent: parent, root: root, opts: opts })
  extend(this, item)


  // attributes
  each(root.attributes, function(attr) {
    var name = attr.name,
        val = attr.value

    attributes[name] = val

    // remove dynamic attributes from node
    if (val.indexOf(brackets(0)) >= 0) {
      remAttr(root, name)
      return false
    }
  })

  // options
  function updateOpts() {
    each(Object.keys(attributes), function(name) {
      opts[name] = tmpl(attributes[name], parent || self)
    })
  }

  updateOpts()

  // child
  var dom = mkdom(impl.tmpl),
      loop_dom


  this.update = function(data, init) {
    extend(self, data)
    extend(self, item)
    updateOpts()
    self.trigger('update', item)
    update(expressions, self, item)
    self.trigger('updated')
  }

  this.unmount = function() {
    var el = is_loop ? loop_dom : root,
        p = el.parentNode

    if (p) {
      p.removeChild(el)
      self.trigger('unmount')
      parent && parent.off('update', self.update).off('unmount', self.unmount)
      self.off('*')
    }
  }

  function mount() {

    // internal use only, fixes #403
    self.trigger('premount')

    if (is_loop) {
      loop_dom = dom.firstChild
      root.insertBefore(loop_dom, conf.before || null) // null needed for IE8

    } else {
      while (dom.firstChild) root.appendChild(dom.firstChild)
    }

    if (root.stub) self.root = root = parent.root

    // one way data flow: propagate updates and unmounts downwards from parent to children
    parent && parent.on('update', self.update).one('unmount', self.unmount)

    self.trigger('mount')
  }

  // named elements available for fn
  parseNamedElements(dom, this)

  // fn (initialiation)
  if (impl.fn) impl.fn.call(this, opts)

  // parse layout after init. fn may calculate args for nested custom tags
  parseLayout(dom, this, expressions)

  this.update()
  mount()

}
