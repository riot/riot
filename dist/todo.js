
;(function(riot, doc) {

  var BOOL_ATTR = /^(checked|selected|disabled|readonly|multiple|autofocus|hidden)$/i,
      tmpl = riot._tmpl,
      all_tags = [],
      tag_impl = {}

  function each(nodes, fn) {
    for (var i = 0; i < (nodes || []).length; i++) {
      fn(nodes[i], i)
    }
  }

  function extend(obj, from) {
    from && Object.keys(from).map(function(key) {
      obj[key] = from[key]
    })
    return obj
  }

  function diff(arr1, arr2) {
    return arr1.filter(function(el) {
      return arr2.indexOf(el) < 0
    })
  }

  function walk(dom, fn) {
    fn(dom)
    dom = dom.firstChild

    while (dom) {
      walk(dom, fn)
      dom = dom.nextSibling
    }
  }


  function mkdom(tmpl) {
    var el = doc.createElement('div')
    el.innerHTML = tmpl
    return el
  }


  function update(expressions, instance) {

    instance.trigger('update')

    each(expressions, function(expr) {
      var tag = expr.tag,
          dom = expr.dom

      function remAttr(name) {
        dom.removeAttribute(name)
      }

      if (expr.loop) {
        remAttr('each')
        return loop(expr, instance)
      }

      if (tag) return tag.update ? tag.update() :
        expr.tag = createTag({ tmpl: tag[0], fn: tag[1], root: dom, parent: instance })

      var attr_name = expr.attr,
          value = tmpl(expr.expr, instance)

      if (value && expr.value === value) return
      expr.value = value

      if (!attr_name) return dom.nodeValue = (value == null ? '' : value)

      if (!value || /obj|func/.test(typeof value)) remAttr(attr_name)

      if (typeof value == 'function') {
        dom[attr_name] = function(e) {

          e = e || window.event
          e.which = e.which || e.charCode || e.keyCode
          e.target = e.target || e.srcElement
          e.data = instance.__data__ || instance
          e.currentTarget = dom

          if (value.call(instance, e) !== true) {
            e.preventDefault && e.preventDefault()
            e.returnValue = false
          }

          instance.update()
        }

      } else if (/^(show|hide|if)$/.test(attr_name)) {
        remAttr(attr_name)
        if (attr_name == 'hide') value = !value
        dom.style.display = value ? '' : 'none'

      } else if (value) {
        if (BOOL_ATTR.test(attr_name)) value = attr_name
        dom.setAttribute(attr_name, value)
      }

    })

    instance.trigger('updated')

  }

  function parse(root) {

    var named_elements = {},
        expressions = []

    walk(root, function(dom) {

      var type = dom.nodeType,
          value = dom.nodeValue

      function addExpr(value, data) {
        if (data || value.indexOf('{') >= 0) {
          var expr = { dom: dom, expr: value }
          expressions.push(extend(expr, data || {}))
        }
      }

      if (type == 3 && dom.parentNode.tagName != 'STYLE') {
        addExpr(value)

      } else if (type == 1) {

        value = dom.getAttribute('each')
        if (value) return addExpr(value, { loop: 1 })

        var tag = tag_impl[dom.tagName.toLowerCase()]

        each(dom.attributes, function(attr) {
          var name = attr.name,
              value = attr.value

          if (/^(name|id)$/.test(name)) named_elements[value] = dom

          if (!tag) addExpr(value, { attr: name })

        })

        if (tag) addExpr(0, { tag: tag })

      }

    })

    return { expr: expressions, elem: named_elements }

  }


  function createTag(conf) {

    var opts = conf.opts || {},
        dom = mkdom(conf.tmpl),
        mountNode = conf.root,
        parent = conf.parent,
        ast = parse(dom),
        tag = { root: mountNode, opts: opts, parent: parent, __data__: conf.data },
        attributes = {}

    extend(tag, ast.elem)

    each(mountNode.attributes, function(attr) {
      attributes[attr.name] = attr.value
    })

    function updateOpts() {
      Object.keys(attributes).map(function(name) {
        var val = opts[name] = tmpl(attributes[name], parent || tag)
        if (typeof val == 'object') mountNode.removeAttribute(name)
      })
    }

    updateOpts()

    if (!tag.on) {
      riot.observable(tag)
      delete tag.off // off method not needed
    }

    if (conf.fn) conf.fn.call(tag, opts)

    tag.update = function(data, is_init) {

      if (parent && !dom.firstChild) mountNode = parent.root

      if (is_init || doc.body.contains(mountNode)) {
        extend(tag, data)
        extend(tag, tag.__data__)
        updateOpts()
        update(ast.expr, tag)

        parent && parent.update()

      } else {
        tag.trigger('unmount')
      }

    }


    tag.update(0, true)

    while (dom.firstChild) {
      if (conf.before) mountNode.insertBefore(dom.firstChild, conf.before)
      else mountNode.appendChild(dom.firstChild)
    }


    tag.trigger('mount')

    all_tags.push(tag)

    return tag
  }


  function loop(expr, instance) {

    if (expr.done) return
    expr.done = true

    var dom = expr.dom,
        prev = dom.previousSibling,
        root = dom.parentNode,
        template = dom.outerHTML,
        val = expr.expr,
        els = val.split(/\s+in\s+/),
        rendered = [],
        checksum,
        root,
        keys


    if (els[1]) {
      val = '{ ' + els[1]
      keys = els[0].slice(1).trim().split(/,\s*/)
    }

    instance.one('mount', function() {
      root = dom.parentNode
      root.removeChild(dom)
    })

    instance.on('updated', function() {

      var items = tmpl(val, instance)
          is_array = Array.isArray(items),
          start_pos = Array.prototype.indexOf.call(root.childNodes, prev) + 1

      if (is_array) items = items.slice(0)

      else {

        var testsum = JSON.stringify(items)
        if (testsum == checksum) return
        checksum = testsum

        items = Object.keys(items).map(function(key, i) {
          var data = {}
          data[keys[0]] = key
          data[keys[1]] = items[key]
          return data
        })

      }

      diff(rendered, items).map(function(data) {
        var pos = rendered.indexOf(data)
        root.removeChild(root.childNodes[start_pos + pos])
        rendered.splice(pos, 1)
      })

      diff(items, rendered).map(function(data, i) {

        var pos = items.indexOf(data)

        if (keys && !checksum) {
          var obj = {}
          obj[keys[0]] = data
          obj[keys[1]] = i
          data = items[i] = obj
        }

        var tag = createTag({
          before: root.childNodes[start_pos + pos],
          parent: instance,
          tmpl: template,
          data: data,
          root: root
        })

        instance.on('update', tag.update)

      })

      rendered = items

    })

  }

  riot.tag = function(name, tmpl, fn) {
    fn = fn || noop,
    tag_impl[name] = [tmpl, fn]
  }

  riot.mountTo = function(node, tagName, opts) {
    var tag = tag_impl[tagName]
    return tag && createTag({ tmpl: tag[0], fn: tag[1], root: node, opts: opts })
  }

  riot.mount = function(selector, opts) {
    if (selector == '*') selector = Object.keys(tag_impl).join(', ')

    var instances = []

    each(doc.querySelectorAll(selector), function(node) {
      if (node.riot) return

      var tagName = node.tagName.toLowerCase(),
          instance = riot.mountTo(node, tagName, opts)

      if (instance) {
        instances.push(instance)
        node.riot = 1
      }
    })

    return instances
  }

  riot.update = function() {
    all_tags.map(function(tag) {
      tag.update()
    })
    return all_tags
  }

})(riot, document)
