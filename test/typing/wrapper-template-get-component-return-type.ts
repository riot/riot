import { TemplateChunk } from '@riotjs/dom-bindings'
import { RiotComponentWrapper, RiotComponent } from '../../riot'

declare const testWrapper: RiotComponentWrapper<RiotComponent>
testWrapper.template!(
  null as any,
  null as any,
  null as any,
  () => {
    return () => {
      return {} as TemplateChunk
    }
  },
)
testWrapper.template!(
  null as any,
  null as any,
  null as any,
  //@ts-expect-error
  (componentName) => {
    return `${componentName}: this will throw an error`
  },
)
