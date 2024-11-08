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
