import { composeTypes, DefaultProps, WithTypes, withTypes } from '../../riot'

export const wrapper: WithTypes<DefaultProps, {
  nonOverridableMethod(): void,
  nonOverridableProperty: number,
}, {
  overridablePublicMethod(): number,
  overridablePublicProperty: string,
}, {
  overridablePrivateMethod(): Record<string, any>,
  overridablePrivateProperty: boolean,
}> = originalComponent => {
  const component = originalComponent as any

  component.nonOverridableMethod = () => { }
  component.nonOverridableProperty = 12

  component.overridablePublicMethod = () => 23
  component.overridablePublicProperty = "hello"

  component.overridablePrivateMethod = () => ({ test: 45 })
  component.overridablePrivateProperty = false

  return component;
}

export const emitEvents: WithTypes<DefaultProps, {
  emit(type: string): void,
}> = originalComponent => {
  const component = originalComponent as any

  component.emit = (type: string) => {
    console.log(`Emitting event "${type}"`)
  }

  return component;
}

export const Component = composeTypes(wrapper, emitEvents)({
  overridablePublicMethod() {
    return 54
  },
  overridablePublicProperty: "hello world",
  overridablePrivateMethod() {
    return {
      test: "any"
    }
  },
  overridablePrivateProperty: true,
  onClick() {
    this.update({ clicked: true })
    this.emit("click")
    this.nonOverridableMethod()
    this.nonOverridableProperty = 12
  },
  onMounted() {
    this.state = { clicked: false }
    this.onClick()
  },
})

export const Component2 = composeTypes(wrapper, emitEvents)({
  //@ts-expect-error
  nonOverridableMethod() { },
  //@ts-expect-error
  nonOverridableProperty: 44,
  //@ts-expect-error
  emit(type) { }
})

export const Component3 = composeTypes(withTypes)({
  onClick() {
    this.update({ clicked: true })
  },
  onMounted() {
    //@ts-expect-error
    this.state = 2
    this.onClick()
  },
})

export const Component4 = composeTypes(withTypes as WithTypes<{
  customProp: number
}>, emitEvents)({
  onBeforeMount(props) {
    console.log(props.customProp)
    this.emit("before-mount")
    //@ts-expect-error
    props.customProp = "test"
  },
  onMounted() {
    //@ts-expect-error
    this.onClick();
  },
})
