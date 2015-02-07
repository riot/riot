
/*
  - mount/unmount for conditionals and loops
  - loop = array of tags
*/
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
    var name = attr.name
    attributes[name] = attr.value
    remAttr(root, name) // --> tag-nesting fails
    return false
  })

  // options
  function updateOpts() {
    Object.keys(attributes).map(function(name) {
      opts[name] = tmpl(attributes[name], parent || self)
    })
  }

  updateOpts()

  this.update = function() {}

  var dom = parse(impl.tmpl, this, expressions),
      loop_dom

  // constructor function
  if (impl.fn) impl.fn.call(this, opts)

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
    parent && parent.off('unmount', self.unmount).off('update', self.update)
    mounted = false
  }

  this.mount = function() {
    while (dom.firstChild) {
      if (is_loop) {
        loop_dom = dom.firstChild
        root.insertBefore(dom.firstChild, conf.before)

      } else {
        root.appendChild(dom.firstChild)
      }
    }

    if (!root.parentNode) self.root = root = parent.root

    self.trigger('mount')

    // one way data flow
    parent && parent.on('mount', function() {
      parent.on('update', self.update).on('unmount', self.unmount)
    })

  }

  this.update()
  this.mount()

}
