/**
 * The YieldTag returns a special riot.tag that can be used to transclude html from the parent
 * to the child elements see bug #300
 * @param { string } tmpl - the html template we want to transclude into the child tag
 * @param { object } container - child tag instance
 * @param { object } containerDOM - dom of the child tag
 * @param { object } parent - parent of the child tag
 * @returns { object } Tag instance
 */
function YieldTag (tmpl, container, containerDOM, parent) {

  // create a new tag instance using the tmpl included in the child tag
  var tag = new Tag({ tmpl: tmpl, fn: noop }, {
        parent: container,
        root: document.createElement('div'),
        opts: parent.opts
      }),
      // the mount will be overridden below
      originalMount = tag.mount

  // update the yield tag content synchronizing them with the parent
  function updateYield() {
    syncYield()
    tag.update()
  }

  // copy all the parent properties also to the yield tag
  function syncYield() {
    // list of properties/methods we do not need to sync with the parent tag
    var propsBlackList = 'on off mount unmount update tags root parent _id one trigger'.split(' ')
    // extend the yield tag using the parent properties
    each(Object.keys(parent), function(key) {
      if (!~propsBlackList.indexOf(key)) tag[key] = parent[key]
    })
  }

  // we need to override the mount function to let the yield tag work properly
  tag.mount = function (opts) {

    syncYield()
    // mount the tag
    originalMount.call(tag, opts)

    // sync it with the parent
    tag.on('update', parent.update)
    parent.on('update', updateYield)
    tag.on('unmount', function() {
      parent.off('update', updateYield)
    })

    // get the yield placeholder
    var yieldPlaceholder = $$('yield', containerDOM)[0],
        childNodes = tag.root.childNodes

    // replace the placeholder
    each(childNodes, function(child) {
      yieldPlaceholder.parentNode.insertBefore(child, yieldPlaceholder)
    })
    // remove the placeholder
    yieldPlaceholder.parentNode.removeChild(yieldPlaceholder)
  }

  return tag

}

// Helpers
// these method are public and could be used also in other classes
// for example in tag

function getYieldRegex () {
  // we can not store the regex in a variable
  // because somehow it does not work on chrome lower than 24
  return /<(yield)\/?>(<\/\1>)?/gim
}

function hasYield(tmpl) {
  return getYieldRegex().test(tmpl)
}

function replaceYield (tmpl, innerHTML) {
  tmpl = tmpl.replace(getYieldRegex(), innerHTML || '')
  return tmpl
}

