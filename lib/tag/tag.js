
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
      opts = conf.opts

  // cannot initialize twice on the same root element
  if (!is_loop && root.riot) return
  root.riot = 1

  opts = opts || {}

  extend(this, { parent: parent, root: root, opts: opts })

  // attributes
  each(root.attributes, function(attr) {
    attributes[attr.name] = attr.value
    // remAttr(root, attr.name) --> tag-nesting fails
  })

  // options
  function updateOpts() {
    Object.keys(attributes).map(function(name) {
      opts[name] = riot._tmpl(attributes[name], parent || self)
    })
  }

  updateOpts()

  this.update = function() {}

  var dom = parse(impl.tmpl, this, expressions)

  // constructor function
  if (impl.fn) impl.fn.call(this, opts)

  this.update = function(data) {
    extend(this, data)
    extend(this, conf.item)
    self.trigger('update')
    updateOpts()
    update(expressions, self, conf.item)
    self.trigger('updated')
  }

  this.mount = function() {
    while (dom.firstChild) {
      if (is_loop) root.insertBefore(dom.firstChild, conf.before)
      else root.appendChild(dom.firstChild)
    }

    self.trigger('mount')
  }

  this.unmount = function() {

    // remove from DOM
    var p = root.parentNode
    if (!is_loop && p) p.removeChild(root)

    // remove from parent
    if (parent) {
      var els = parent.children
      els.splice(els.indexOf(self), 1)
    }

    self.trigger('unmount')
  }

  this.update()
  this.mount()

  // one way data flow
  parent && parent.on('update', self.update)
  parent && parent.on('unmount', self.unmount)

}
