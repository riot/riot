import { withTypes } from '../../riot'

export const Component = withTypes({
  onClick() {
    this.update({ clicked: true })
  },
  onMounted() {
    this.state = { clicked: false }
    this.onClick()
  },
})

export const Component2 = withTypes({
  onClick() {
    this.update({ clicked: true })
  },
  onMounted() {
    //@ts-expect-error
    this.state = 2
    this.onClick()
  },
})

export const Component3 = withTypes({
  onMounted() {
    //@ts-expect-error
    this.onClick()
  },
})
