import { WithTypes, withTypes } from '../../riot'

/**
 * test: component can assign state to object
 */
export const Component1 = withTypes({
  onMounted() {
    this.state = { clicked: false }
  },
})

/**
 * test: component can't assign state to non Record object
 */
export const Component2 = withTypes({
  onClick() {
    this.update({ clicked: true })
  },
  onMounted() {
    //@ts-expect-error
    this.state = 2
  },
})

/**
 * test: component does infer this and its methods and properties
 */
export const Component3 = withTypes({
  someProp: 'random',
  onClick() {
    console.log('click', this.someProp)
  },
  onMounted() {
    this.onClick()
    console.log(this.someProp)
  },
})

/**
 * test: component does infer this erroring on undefined methods
 */
export const Component4 = withTypes({
  onMounted() {
    //@ts-expect-error
    this.undefinedMethod()
  },
})

/**
 * test: component does infer this erroring on undefined properties
 */
export const Component5 = withTypes({
  onMounted() {
    //@ts-expect-error
    console.log(this.undefinedProp)
  },
})

/**
 * test: component can specify any property or method
 *
 * [issue #3046](https://github.com/riot/riot/issues/3046)
 * Different behavior compared to the one shown in #3046
 * because now withTypes does infer the component type
 * directly from the passed object,
 * instead of from the type parameters
 */
export const Component6 = withTypes({
  onload() {},
})

/**
 * test: component can specify any property or method
 *       alongisde with other riot lifecycle callbacks
 *
 * [issue #3046](https://github.com/riot/riot/issues/3046)
 * Here I can specify onload freely as before
 * and defining onBeforeMount doesn't break the
 * type infer, on the contrary I get proper autocompletion
 */
export const Component7 = withTypes({
  state: {},
  onload() {},
  onBeforeMount() {
    this.onload()
  },
})

/**
 * test: with types can inject props type
 */
export const Component8 = (withTypes as WithTypes<{ customProp: number }>)({
  onBeforeMount(props) {
    props.customProp
  },
})

/**
 * test: injected props type won't allow undefined property access
 */
export const Component9 = (
  withTypes as WithTypes<{
    customProp: number
  }>
)({
  onBeforeMount(props) {
    //@ts-expect-error
    props.undefinedProp
  },
})

/**
 * test: with types can inject state type both into this and return value
 */
export const Component10 = withTypes({
  state: {
    hidden: false,
  },
  onBeforeMount() {
    //@ts-expect-error
    this.state.hidden = "won't work"
  },
})
//@ts-expect-error
Component10.state.hidden = "won't work either"
