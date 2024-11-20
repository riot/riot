import { RiotComponentWrapper, RiotComponent } from '../../riot'

declare const testWrapper: RiotComponentWrapper<RiotComponent>
testWrapper.template!(
  null as any,
  null as any,
  null as any,
  (componentName) => {
    return testWrapper.exports?.components?.[componentName]
  },
)
testWrapper.template!(
  null as any,
  null as any,
  null as any,
  (componentName) => {
    return `${componentName}: this will throw an error`
  },
)
