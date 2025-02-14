import { withTypes } from '../../riot'

/**
 * test: component can assign state to object
 */
export const Component1 = withTypes({
  onMounted() {
    this.state = { clicked: false }
  },
})

export const Component1Fn = withTypes(() => ({
  onMounted() {
    this.state = { clicked: false }
  },
}))

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

export const Component2Fn = withTypes(() => ({
  onClick() {
    this.update({ clicked: true })
  },
  onMounted() {
    //@ts-expect-error
    this.state = 2
  },
}))

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

export const Component3Fn = withTypes(() => ({
  someProp: 'random',
  onClick() {
    console.log('click', this.someProp)
  },
  onMounted() {
    this.onClick()
    this.update()
    console.log(this.someProp)
  },
}))

/**
 * test: component does infer this erroring on undefined methods
 */
export const Component4 = withTypes({
  onMounted() {
    //@ts-expect-error
    this.undefinedMethod()
  },
})

export const Component4Fn = withTypes(() => ({
  onMounted() {
    //@ts-expect-error
    this.undefinedMethod()
  },
}))

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
  onload() {
    this.update()
  },
})

export const Component6Fn = withTypes(() => ({
  onload() {
    this.update()
  },
}))

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

    this.update()
  },
})

export const Component7Fn = withTypes(() => ({
  state: {},
  onload() {},
  onBeforeMount() {
    this.onload()

    this.update()
  },
}))

/**
 * test: with types can inject props type
 */
type Component8Props = { customProp: string }

export const Component8 = withTypes({
  onClick() {},
  onBeforeMount(props: Component8Props) {
    props.customProp

    this.onClick()
    this.update()
  },
})

export const Component8Fn = withTypes(() => ({
  onClick() {},
  onBeforeMount(props: Component8Props) {
    props.customProp

    this.onClick()
    this.update()
  },
}))

/**
 * test: injected props type won't allow undefined property access
 */
type Component9Props = { customProp: string }

export const Component9 = withTypes({
  onBeforeMount(props: Component9Props) {
    //@ts-expect-error
    props.undefinedProp

    this.update()
  },
})

export const Component9Fn = withTypes(() => ({
  onBeforeMount(props: Component9Props) {
    //@ts-expect-error
    props.undefinedProp

    this.update()
  },
}))

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

    this.update()
  },
})

export const Component10Fn = withTypes(() => ({
  state: {
    hidden: false,
  },
  onBeforeMount() {
    //@ts-expect-error
    this.state.hidden = "won't work"

    this.update()
  },
}))

//@ts-expect-error
Component10.state.hidden = "won't work either"
