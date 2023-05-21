declare module '*.riot' {
  // @ts-ignore
  import { RiotComponetWrapper, RiotComponent } from '../../riot'

  const componentWrapper: RiotComponetWrapper<RiotComponent>

  export default componentWrapper
}
