import {
  SlotBindingData,
  TemplateChunk,
  BindingData,
  AttributeExpressionData,
  ExpressionType,
  BindingType
} from '@riotjs/dom-bindings'

// Internal Types and shortcuts
export type RegisteredComponentsMap = Map<string, () => RiotComponent>
export type ComponentEnhancer = <Props = any, State = any>(component: RiotComponent<Props, State>) => RiotComponent<Props, State>
export type InstalledPluginsSet = Set<ComponentEnhancer>
export type RiotComponentsMap = {
  [key: string]: RiotComponentWrapper
}
export type AutobindObjectMethods<Object, This> = {
  [K in keyof Object]: Object[K] extends (...args: any) => any ? (this: This, ...args: Parameters<Object[K]>) => ReturnType<Object[K]> : Object[K]
}

export interface RiotComponent<Props = any, State = any> {
  // automatically generated on any component instance
  readonly props: Props
  readonly root: HTMLElement
  readonly name?: string
  readonly slots: SlotBindingData[]

  // mutable state property
  state: State
  // optional alias to map the children component names
  components?: RiotComponentsMap

  mount(
    element: HTMLElement,
    initialState?: State,
    parentScope?: object
  ): RiotComponent<Props, State>
  update(
    newState?: Partial<State>,
    parentScope?: object
  ): RiotComponent<Props, State>
  unmount(keepRootElement?: boolean): RiotComponent<Props, State>

  // Helpers
  $(selector: string): Element | null
  $$(selector: string): Element[]

  // state handling methods
  shouldUpdate?(newProps: Props, oldProps: Props): boolean

  // lifecycle methods
  onBeforeMount?(props: Props, state: State): void
  onMounted?(props: Props, state: State): void
  onBeforeUpdate?(props: Props, state: State): void
  onUpdated?(props: Props, state: State): void
  onBeforeUnmount?(props: Props, state: State): void
  onUnmounted?(props: Props, state: State): void
}

// The Riot component object without the internals
// The internal attributes will be handled by the framework
export type RiotComponentWithoutInternals<Component extends RiotComponent> = Omit<Component, 'props' | 'root' | 'name' | 'slots' | 'mount' | 'update' | 'unmount' | '$' | '$$'>
export type RiotComponentWithoutInternalsAndInitialState<Component extends RiotComponent> = Omit<RiotComponentWithoutInternals<Component>, 'state'>

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

export interface PureComponentFactoryFunction<InitialProps = any, Context = any> {
  ({
     slots,
     attributes,
     props
   }: { slots?: SlotBindingData<Context>[], attributes?: AttributeExpressionData<Context>[], props?: InitialProps; }): RiotPureComponent<Context>
}

// This object interface is created anytime a riot file will be compiled into javascript
export interface RiotComponentWrapper<Component = RiotComponent> {
  readonly css?: string | null
  readonly exports?: RiotComponentFactoryFunction<Component> | Component | null
  readonly name?: string | null

  template?(
    template: (template: string, bindings?: BindingData<Component>[]) => TemplateChunk<Component>,
    expressionTypes: Record<keyof typeof ExpressionType, number>,
    bindingTypes: Record<keyof typeof BindingType, number>,
    getComponent: (componentName: string) => any
  ): TemplateChunk<Component> | null
}

// Interface for components factory functions
export interface RiotComponentFactoryFunction<Component> {
  (): Component
  components?: RiotComponentsMap
}

// Riot public API
export function register<Props, State>(componentName: string, wrapper: RiotComponentWrapper<RiotComponent<Props, State>>): RegisteredComponentsMap
export function unregister(componentName: string): RegisteredComponentsMap
export function mount<Props, State>(selector: string | HTMLElement, initialProps?: Props, componentName?: string): RiotComponent<Props, State>[]
export function unmount(selector: string | HTMLElement, keepRootElement?: boolean): HTMLElement[]
export function install(plugin: ComponentEnhancer): InstalledPluginsSet
export function uninstall(plugin: ComponentEnhancer): InstalledPluginsSet
export function component<Props, State, Component = RiotComponent<Props, State>>(wrapper: RiotComponentWrapper<Component>): (
  el: HTMLElement,
  initialProps?: Props,
  meta?: { slots: SlotBindingData[]; attributes: AttributeExpressionData[]; parentScope: any; }
) => Component

export function pure<InitialProps = any, Context = any, FactoryFunction = PureComponentFactoryFunction<InitialProps, Context>>(func: FactoryFunction): FactoryFunction

export const version: string

// typescript specific methods
export function withTypes<Component extends RiotComponent,
  ComponentFactory = RiotComponentFactoryFunction<AutobindObjectMethods<RiotComponentWithoutInternals<Component>, Component>>
  >(fn: ComponentFactory): () => Component
export function withTypes<Component extends RiotComponent,
  ComponentFactory = RiotComponentFactoryFunction<AutobindObjectMethods<RiotComponentWithoutInternalsAndInitialState<Component>, Component>>
  >(fn: ComponentFactory): () => Component
export function withTypes<Component extends RiotComponent, ComponentObjectWithInitialState = RiotComponentWithoutInternals<Component>>(component: AutobindObjectMethods<ComponentObjectWithInitialState, Component>): Component
export function withTypes<Component extends RiotComponent, ComponentObjectWithoutInitialState = RiotComponentWithoutInternalsAndInitialState<Component>>(component: AutobindObjectMethods<ComponentObjectWithoutInitialState, Component>): Component

