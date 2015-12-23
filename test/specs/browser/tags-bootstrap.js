
// bootstrap all the tags
loadTagsAndScripts([
  'tag/~custom-parsers.tag',
  'tag/loop.tag',
  'tag/loop-child.tag',
  'tag/loop-reorder.tag',
  'tag/loop-manip.tag',
  'tag/loop-object.tag',
  'tag/loop-tag-instances.tag',
  'tag/loop-numbers-nested.tag',
  'tag/loop-nested-strings-array.tag',
  'tag/loop-events.tag',
  'tag/loop-sync-options-nested.tag',
  'tag/loop-inherit.tag',
  'tag/loop-double-curly-brackets.tag',
  'tag/loop-conditional.tag',
  'tag/table-multibody.tag',
  'tag/loop-cols.tag',
  'tag/nested-child.tag',
  'tag/loop-option.tag',
  'tag/loop-optgroup.tag',
  'tag/loop-optgroup2.tag',
  'tag/loop-position.tag',
  'tag/loop-arraylike.tag',
  'tag/loop-ids.tag',
  'tag/loop-unshift.tag',
  'tag/loop-virtual.tag',
  'tag/loop-null-items.tag',
  'tag/table-data.tag',
  'tag/table-loop-extra-row.tag',
  'tag/loop-named.tag',
  'tag/loop-single-tags.tag',
  'tag/timetable.tag',
  'tag/raw-contents.tag',
  // mount order
  'tag/deferred-mount.tag',

  // multi named elements to an array
  'tag/multi-named.tag',

  // test the preventUpdate feature on the DOM events
  'tag/prevent-update.tag',

  // Don't trigger mount for conditional tags
  'tag/if-mount.tag',

  // input type=number
  'tag/input-number.tag',

  // input type=number
  'tag/nested-riot.tag',

  // recursive tags
  'tag/treeview.tag',

  // sync the loop options
  'tag/loop-sync-options.tag',

  // check if the events get triggered correctly
  'tag/events.tag',

  // pass a riot observable as option
  'tag/observable-attr.tag',
  'tag/style-tag.tag',
  'tag/style-tag2.tag',
  'tag/~style-tag3.tag',
  'tag/style-tag4.tag',

  'tag/preserve-attr.tag',

  // these tags will be not autoinjected in the DOM
  // that's what `name = false` means
  {
    path: 'tag/ploop-tag.tag',
    name: false
  },
  {
    path: 'tag/timer.tag',
    name: false
  },
  {
    path: 'tag/yield-nested.tag',
    name: false
  },
  {
    path: 'tag/inner-html.tag',
    name: false
  },
  {
    path: 'tag/outer.tag',
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