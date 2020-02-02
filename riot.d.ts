import { SlotBindingData, AttributeExpressionData } from '@riotjs/dom-bindings'

// This interface is only exposed and any Riot component will receive the following properties
export interface RiotCoreComponent<Props = object, State = object> {
  // automatically generated on any component instance
  readonly props: Props
  readonly root: HTMLElement
  readonly name?: string
  // TODO: add the @riotjs/dom-bindings types
  readonly slots: SlotBindingData[]
  mount(
    element: HTMLElement,
    initialState?: State,
    parentScope?: object
  ): RiotComponent<Props, State>
  update(
    newState?: Partial<State>,
    parentScope?: object
  ): RiotComponent<Props, State>
  unmount(keepRootElement: boolean): RiotComponent<Props, State>

  // Helpers
  $(selector: string): HTMLElement
  $$(selector: string): [HTMLElement]
}

// Riot Pure Component interface that should be used together with riot.pure
export interface RiotPureComponent<Context = object> {
  mount(
    element: HTMLElement,
    context?: Context,
  ): RiotPureComponent<Context>
  update(
    context?: Context,
  ): RiotPureComponent<Context>
  unmount(keepRootElement: boolean): RiotPureComponent<Context>
}

export interface PureComponentFactoryFunction<InitialProps = any, Context = object> {
  ({slots, attributes, props}:{ slots?: SlotBindingData[], attributes?: AttributeExpressionData[], props?: InitialProps; }): RiotPureComponent<Context>
}

// This object interface is created anytime a riot file will be compiled into javascript
export interface RiotComponentShell<Props = object, State = object> {
  readonly css?: string
  readonly exports?: () => RiotComponentExport<Props, State>|object
  readonly name?: string
  // TODO: add the @riotjs/dom-bindings types
  template(): any
}

// Interface that can be used when creating the components export
export interface RiotComponentExport<Props = object, State = object> {
  // optional on the component object
  state?: State

  // optional alias to map the children component names
  components?: {
    [key: string]: RiotComponentShell<Props, State>
  }

  // state handling methods
  shouldUpdate?(newProps: Props, currentProps: Props): boolean

  // lifecycle methods
  onBeforeMount?(currentProps: Props, currentState: State): void
  onMounted?(currentProps: Props, currentState: State): void
  onBeforeUpdate?(currentProps: Props, currentState: State): void
  onUpdated?(currentProps: Props, currentState: State): void
  onBeforeUnmount?(currentProps: Props, currentState: State): void
  onUnmounted?(currentProps: Props, currentState: State): void
  [key: string]: any
}

// All the RiotComponent Public interface properties are optional
export interface RiotComponent<Props = object, State = object> extends RiotCoreComponent<Props, State>, RiotComponentExport<Props, State> {}

export type RegisteredComponentsMap = Map<string, () => RiotComponent>
export type ComponentEnhancer = <Props, State>(component: RiotComponent<Props, State>) => RiotComponent<Props, State>
export type InstalledPluginsSet = Set<ComponentEnhancer>

export function register<Props, State>(componentName: string, shell: RiotComponentShell<Props, State>): RegisteredComponentsMap
export function unregister(componentName: string): RegisteredComponentsMap
export function mount<Props = object, State = object>(selector: string, initialProps?: Props, componentName?: string): RiotComponent<Props, State>[]
export function unmount(selector: string, keepRootElement: boolean):HTMLElement[]
export function install(plugin: ComponentEnhancer):InstalledPluginsSet
export function uninstall(plugin: ComponentEnhancer):InstalledPluginsSet
export function component<Props , State>(shell: RiotComponentShell<Props, State>):(
  el: HTMLElement,
  initialProps?: Props,
  meta?: { slots: SlotBindingData[]; attributes: AttributeExpressionData[]; parentScope: any; }
) => RiotComponent<Props, State>

export function pure<InitialProps = object, Context = object, FactoryFunction = PureComponentFactoryFunction<InitialProps, Context>>(func: FactoryFunction): FactoryFunction
export const version: string
