
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

  extend(this, { parent: parent, root: root, opts: opts, children: [] })
  extend(this, item)


  // attributes
  each(root.attributes, function(attr) {
    var name = attr.name,
        val = attr.value

    attributes[name] = val

    // remove dynamic attributes from node
    if (val.indexOf('{') >= 0) {
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
  parent && parent.children.push(this)

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

    if (is_loop) {
      root.removeChild(loop_dom)

    } else {
      var p = root.parentNode
      p && p.removeChild(root)
    }

    // splice from parent.children[]
    if (parent) {
      var els = parent.children
      els.splice(els.indexOf(self), 1)
    }

    self.trigger('unmount')

    // cleanup
    parent && parent.off('update', self.update)
    mounted = false
  }

  function mount() {
    while (dom.firstChild) {
      if (is_loop) {
        loop_dom = dom.firstChild
        root.insertBefore(dom.firstChild, conf.before || null) // null needed for IE8

      } else {
        root.appendChild(dom.firstChild)
      }
    }

    if (!hasParent(root)) self.root = root = parent.root

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

