import {
  SlotBindingData,
  TemplateChunk,
  AttributeExpressionData,
  ExpressionType,
  BindingType,
  template
} from '@riotjs/dom-bindings'

// Internal Types and shortcuts
export type Nil = null | undefined
export type RegisteredComponentsMap = Map<string, () => RiotComponent<any, any>>
export type ComponentEnhancer = <Props = object, State = object>(component: RiotComponent<Props, State>) => RiotComponent<Props, State>
export type InstalledPluginsSet = Set<ComponentEnhancer>
export type RiotComponentsMap = {
  [key: string]: RiotComponentShell<any, any>
}

// This interface is only exposed and any Riot component will receive the following properties
export interface RiotCoreComponent<Props = object, State = object> {
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

export interface PureComponentFactoryFunction<InitialProps = object, Context = object> {
  ({
     slots,
     attributes,
     props
   }: { slots?: SlotBindingData<Context>[], attributes?: AttributeExpressionData<Context>[], props?: InitialProps; }): RiotPureComponent<Context>
}

// This object interface is created anytime a riot file will be compiled into javascript
export interface RiotComponentShell<Props = object, State = object, ComponentExport = RiotComponentExport<Props, State>> {
  readonly css?: string | Nil
  readonly exports?: RiotComponentExportFactoryFunction<ComponentExport> | ComponentExport | Nil
  readonly name?: string | Nil

  template(
    templateFn: (...params: Parameters<typeof template>) => TemplateChunk<RiotComponent<Props, State>>,
    expressionTypes: Record<keyof typeof ExpressionType, number>,
    bindingTypes: Record<keyof typeof BindingType, number>,
    getComponent: (componentName: string) => any
  ): TemplateChunk<RiotComponent<Props, State>>
}

// Interface for components factory functions
export interface RiotComponentExportFactoryFunction<ComponentExport = RiotComponentExport> {
  (): ComponentExport
  components?: RiotComponentsMap
}

// Interface that can be used to create the components export
export interface RiotComponentExport<Props = object, State = object> {
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
export interface RiotComponent<Props = object, State = object> extends RiotCoreComponent<Props, State>, RiotComponentExport<Props, State> {
}

// Riot public API
export function register<Props, State>(componentName: string, shell: RiotComponentShell<Props, State>): RegisteredComponentsMap
export function unregister(componentName: string): RegisteredComponentsMap
export function mount<Props, State>(selector: string | HTMLElement, initialProps?: Props, componentName?: string): RiotComponent<Props, State>[]
export function unmount(selector: string | HTMLElement, keepRootElement: boolean): HTMLElement[]
export function install(plugin: ComponentEnhancer): InstalledPluginsSet
export function uninstall(plugin: ComponentEnhancer): InstalledPluginsSet
export function component<Props, State>(shell: RiotComponentShell<Props, State>): (
  el: HTMLElement,
  initialProps?: Props,
  meta?: { slots: SlotBindingData[]; attributes: AttributeExpressionData[]; parentScope: any; }
) => RiotComponent<Props, State>
export function pure<InitialProps = object, Context = object, FactoryFunction = PureComponentFactoryFunction<InitialProps, Context>>(func: FactoryFunction): FactoryFunction
export const version: string
