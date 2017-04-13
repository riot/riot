var nonState = 'isMounted _internal parent opts _parent refs tags'.split(' ')

var reload = function(name) {
  riot.util.styleManager.inject()

  var elems = document.querySelectorAll(name + ', [data-is=' + name + ']')
  for(var i=0; i < elems.length; i++) {
    var el = elems[i], oldTag = el._tag, v
    reload.trigger('before-unmount', oldTag)
    oldTag.unmount(true) // detach the old tag

    // reset the innerHTML and attributes to how they were before mount
    el.innerHTML = oldTag._internal.innerHTML;
    (oldTag._internal.origAttrs || []).map(function(attr) {
      el.setAttribute(attr.name, attr.value)
    })

    // copy options for creating the new tag
    var newOpts = {}
    for(key in oldTag.opts) {
      newOpts[key] = oldTag.opts[key]
    }
    newOpts.parent = oldTag.parent

    // create the new tag
    reload.trigger('before-mount', newOpts, oldTag)
    var newTag = riot.mount(el, newOpts)[0]

    // copy state from the old to new tag
    for(var key in oldTag) {
      v = oldTag[key]
      if (~nonState.indexOf(key)) continue
      if (v instanceof HTMLElement) continue // ignore refs
      if (typeof(v) === 'function') continue // ignore the tag's functions
      newTag[key] = v
    }
    newTag.update()
    reload.trigger('after-mount', newTag, oldTag)
  }
}

riot.observable(reload)
riot.util.hotReloader = reload
