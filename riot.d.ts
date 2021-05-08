import { SlotBindingData, TemplateChunk, AttributeExpressionData, ExpressionType, BindingType, template } from '@riotjs/dom-bindings'

// This interface is only exposed and any Riot component will receive the following properties
export interface RiotCoreComponent<Props extends object, State extends object> {
  // automatically generated on any component instance
  readonly props: Props
  readonly root: HTMLElement
  readonly name?: string
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

export type RiotComponentsMap = {
  [key: string]: RiotComponentShell<any, any>
}

// Riot Pure Component interface that should be used together with riot.pure
export interface RiotPureComponent<Context extends object> {
  mount(
    element: HTMLElement,
    context?: Context,
  ): RiotPureComponent<Context>
  update(
    context?: Context,
  ): RiotPureComponent<Context>
  unmount(keepRootElement: boolean): RiotPureComponent<Context>
}

export interface PureComponentFactoryFunction<InitialProps extends object, Context extends object> {
  ({slots, attributes, props}:{ slots?: SlotBindingData[], attributes?: AttributeExpressionData[], props?: InitialProps; }): RiotPureComponent<Context>
}

// This object interface is created anytime a riot file will be compiled into javascript
export interface RiotComponentShell<Props extends object, State extends object> {
  readonly css?: string
  readonly exports?: (() => RiotComponentExport<Props, State>)|RiotComponentExport<Props, State>
  readonly name?: string
  template(templateFn: typeof template, expressionTypes: ExpressionType, bindingTypes: BindingType, getComponent: (componentName: string) => any): TemplateChunk
}

// Interface that can be used when creating the components export
export interface RiotComponentExport<Props extends object, State extends object> {
  // optional on the component object
  state?: State

  // optional alias to map the children component names
  components?: RiotComponentsMap

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
export interface RiotComponent<Props extends object, State extends object> extends RiotCoreComponent<Props, State>, RiotComponentExport<Props, State> {}

export type RegisteredComponentsMap = Map<string, () => RiotComponent<any, any>>
export type ComponentEnhancer = <Props extends object, State extends object>(component: RiotComponent<Props, State>) => RiotComponent<Props, State>
export type InstalledPluginsSet = Set<ComponentEnhancer>

export function register<Props extends object, State extends object>(componentName: string, shell: RiotComponentShell<Props, State>): RegisteredComponentsMap
export function unregister(componentName: string): RegisteredComponentsMap
export function mount<Props extends object, State extends object>(selector: string|HTMLElement, initialProps?: Props, componentName?: string): RiotComponent<Props, State>[]
export function unmount(selector: string|HTMLElement, keepRootElement: boolean):HTMLElement[]
export function install(plugin: ComponentEnhancer):InstalledPluginsSet
export function uninstall(plugin: ComponentEnhancer):InstalledPluginsSet
export function component<Props extends object, State extends object>(shell: RiotComponentShell<Props, State>):(
  el: HTMLElement,
  initialProps?: Props,
  meta?: { slots: SlotBindingData[]; attributes: AttributeExpressionData[]; parentScope: any; }
) => RiotComponent<Props, State>

export function pure<InitialProps extends object, Context extends object, FactoryFunction = PureComponentFactoryFunction<InitialProps, Context>>(func: FactoryFunction): FactoryFunction
export const version: string
