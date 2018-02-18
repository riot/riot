import { mixin } from './../core'
import isString from './../../common/util/checks/is-string'
import isFunction from './../../common/util/checks/is-function'
import each from './../../common/util/misc/each'
import contains from './../../common/util/misc/contains'
import getPropDescriptor from './../../common/util/misc/get-prop-descriptor'

/**
 * Add a mixin to this tag
 * @returns { Tag } the current tag instance
 */
export default function componentMixin(tag, ...mixins) {
  each(mixins, (mix) => {
    let instance
    let obj
    let props = []

    // properties blacklisted and will not be bound to the tag instance
    const propsBlacklist = ['init', '__proto__']

    mix = isString(mix) ? mixin(mix) : mix

    // check if the mixin is a function
    if (isFunction(mix)) {
      // create the new mixin instance
      instance = new mix()
    } else instance = mix

    const proto = Object.getPrototypeOf(instance)

    // build multilevel prototype inheritance chain property list
    do props = props.concat(Object.getOwnPropertyNames(obj || instance))
    while (obj = Object.getPrototypeOf(obj || instance))

    // loop the keys in the function prototype or the all object keys
    each(props, (key) => {
      // bind methods to tag
      // allow mixins to override other properties/parent mixins
      if (!contains(propsBlacklist, key)) {
        // check for getters/setters
        const descriptor = getPropDescriptor(instance, key) || getPropDescriptor(proto, key)
        const hasGetterSetter = descriptor && (descriptor.get || descriptor.set)

        // apply method only if it does not already exist on the instance
        if (!tag.hasOwnProperty(key) && hasGetterSetter) {
          Object.defineProperty(tag, key, descriptor)
        } else {
          tag[key] = isFunction(instance[key]) ?
            instance[key].bind(tag) :
            instance[key]
        }
      }
    })

    // init method will be called automatically
    if (instance.init)
      instance.init.bind(tag)(tag.opts)
  })

  return tag
}