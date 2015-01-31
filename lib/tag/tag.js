
/*
  - mount/unmount for conditionals and loops
  - loop = array of tags
*/
function Tag(impl, conf) {

  var self = riot.observable(this),
      expressions = [],
      attributes = {},
      parent = conf.parent,
      root = conf.root,
      opts = conf.opts

  opts = opts || {}

  extend(this, { parent: parent, root: root, opts: opts })

  // attributes
  each(root.attributes, function(attr) {
    attributes[attr.name] = attr.value
    remAttr(root, attr.name)
  })

  // options
  function updateOpts() {
    Object.keys(attributes).map(function(name) {
      opts[name] = riot._tmpl(attributes[name], parent || self)
    })
  }

  updateOpts()

  var dom = parse(impl.tmpl, this, expressions)

  // constructor function
  if (impl.fn) impl.fn.call(this, opts)

  this.update = function(data) {
    extend(this, data)
    extend(this, conf.item)
    self.trigger('update')
    updateOpts()
    update(expressions, self)
    self.trigger('updated')
  }

  this.mount = function() {
    var before = conf.before

    while (dom.firstChild) {
      if (before) root.insertBefore(dom.firstChild, before)
      else root.appendChild(dom.firstChild)
    }

    self.trigger('mount')
  }

  this.unmount = function() {
    root.parentNode.removeChild(root)
    self.trigger('unmount')
  }

  this.update()
  this.mount()

}
