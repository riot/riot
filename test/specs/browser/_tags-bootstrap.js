
// bootstrap all the tags
loadTagsAndScripts([

  'tag/table-multibody.tag',
  'tag/nested-child.tag',

  'tag/table-data.tag',
  'tag/table-thead-tfoot.tag',
  'tag/table-thead-tfoot-nested.tag',

  'tag/timetable.tag',
  'tag/raw-contents.tag',
  'tag/virtual-nested-unmount.tag',
  'tag/table-test.tag',
  'tag/select-test.tag',
  // mount order
  'tag/deferred-mount.tag',
  'tag/expression-eval-count.tag',

  // multi named elements to an array
  'tag/multi-named.tag',
  'tag/named-unmount.tag',

  // test the preventUpdate feature on the DOM events
  'tag/prevent-update.tag',

  // Don't trigger mount for conditional tags
  'tag/if-mount.tag',
  'tag/if-unmount.tag',

  // input type=number
  'tag/input-number.tag',

  'tag/input-values.tag',

  // input type=number
  'tag/nested-riot.tag',

  // recursive tags
  'tag/treeview.tag',



  // check if the events get triggered correctly
  'tag/events.tag',

  // components in virtual get unmountd correctly
  'tag/virtual-nested-component.tag',

  // pass a riot observable as option
  'tag/observable-attr.tag',
  'tag/style-tag.tag',
  'tag/style-tag2.tag',
  'tag/~style-tag3.tag',
  'tag/style-tag4.tag',

  'tag/preserve-attr.tag',

  'tag/reserved-names.tag',

  'tag/should-update.tag',


  'tag/dynamic-data-is.tag',


  // these tags will be not autoinjected in the DOM
  // that's what `name = false` means
  {
    path: 'tag/timer.tag',
    name: false
  },
  {
    path: 'tag/yield-nested.tag',
    name: false
  },
  {
    path: 'tag/yield-no-slash.tag',
    name: false
  },
  {
    path: 'tag/inner-html.tag',
    name: false
  },

  {
    path: 'tag/named-child.tag',
    name: false
  },
  {
    path: 'tag/scoped.tag',
    name: false
  },
  {
    path: 'tag/yield-multi.tag',
    name: false
  },
  {
    path: 'tag/yield-multi2.tag',
    name: false
  },
  {
    path: 'tag/yield-from-default.tag',
    name: false
  },
  {
    path: 'tag/form-controls.tag',
    name: false
  },
  {
    path: 'tag/data-is.tag',
    name: false
  },
  {
    path: 'tag/v-dom-1.tag',
    name: false
  },
  {
    path: 'tag/v-dom-2.tag',
    name: false
  },
  // the following tags will be injected having custom attributes
  {
    path: 'tag/named-select.tag',
    attrs: {
      name: 'i-am-the-select'
    }
  },
  // top most tag preserve attribute expressions
  {
    path: 'tag/top-attributes.tag',
    attrs: {
      cls: 'classy'
    }
  }
])
