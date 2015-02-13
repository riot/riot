
function Tag(impl, conf) {

  var self = riot.observable(this),
      expressions = [],
      attributes = {},
      parent = conf.parent,
      is_loop = conf.loop,
      root = conf.root,
      opts = conf.opts,
      item = conf.item

  // cannot initialize twice on the same root element
  if (!is_loop && root.riot) return
  root.riot = 1

  opts = opts || {}

  extend(this, { parent: parent, root: root, opts: opts })
  extend(this, item)


  // attributes
  each(root.attributes, function(attr) {
    var name = attr.name,
        val = attr.value

    attributes[name] = val

    // remove dynamic attributes from node
    if (val.indexOf(expr_begin) >= 0) {
      remAttr(root, name)
      return false
    }
  })

  // options
  function updateOpts() {
    Object.keys(attributes).map(function(name) {
      opts[name] = tmpl(attributes[name], parent || self)
    })
  }

  updateOpts()

  // child
  var dom = mkdom(impl.tmpl),
      loop_dom

  // named elements
  parseNamedElements(dom, this)

  this.update = function(data, init) {
    extend(self, data)
    extend(self, item)
    self.trigger('update')
    updateOpts()
    update(expressions, self, item)
    self.trigger('updated')
  }

  this.unmount = function() {
    var el = is_loop ? loop_dom : root,
        p = el.parentNode

    if (p) {
      p.removeChild(el)
      self.trigger('unmount')
      parent && parent.off('update', self.update)
    }
  }

  function mount() {

    if (is_loop) {
      loop_dom = dom.firstChild
      root.insertBefore(loop_dom, conf.before || null) // null needed for IE8

    } else {
      while (dom.firstChild) root.appendChild(dom.firstChild)
    }

    if (root.stub) self.root = root = parent.root

    self.trigger('mount')

    // one way data flow: propagate updates and unmounts downwards from parent to children
    parent && parent.on('update', self.update).one('unmount', self.unmount)

  }

  // initialize
  if (impl.fn) impl.fn.call(this, opts)

  // layout
  parseLayout(dom, this, expressions)

  this.update()
  mount()

}

