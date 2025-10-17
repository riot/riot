import { component, createPureComponent, RiotPureComponent } from '../../riot'

type IPureComponent = RiotPureComponent & {
  element: HTMLElement | null
  myProp: string
}

const PureComponent = createPureComponent<{ myProp: string }>(
  ({ slots, props, attributes }) =>
    ({
      element: null,
      myProp: '',
      mount(element) {
        this.element = element
        if (props && props.myProp) {
          this.myProp = props?.myProp.toUpperCase()
        }

        console.log(attributes, slots)
      },
      update() {},
      unmount() {},
    }) satisfies IPureComponent,
)

component(PureComponent)(document.querySelector('.pure')!)
