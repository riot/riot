import {
  TemplateChunk,
  BindingData,
  AttributeExpressionData,
  ExpressionType,
  BindingType,
  template,
  createBinding,
  createExpression,
  bindingTypes,
  expressionTypes,
  TagSlotData,
  TagBindingData,
} from '@riotjs/dom-bindings'

// Internal Types and shortcuts
export type DefaultProps = Record<PropertyKey, any>
export type DefaultState = Record<PropertyKey, any>

export type RegisteredComponentsMap = Map<
  string,
  ({
    slots,
    attributes,
    props,
  }: {
    slots?: TagSlotData[]
    attributes?: AttributeExpressionData[]
    props?: DefaultProps
  }) => RiotComponent
>
export type ComponentEnhancer = <
  Props extends DefaultProps = DefaultProps,
  State extends DefaultState = DefaultState,
>(
  component: RiotComponent<Props, State>,
) => RiotComponent<Props, State>
export type InstalledPluginsSet = Set<ComponentEnhancer>
export type RiotComponentsMap = {
  [key: string]: RiotComponentWrapper<RiotComponent>
}

export type AutobindObjectMethods<Object, Component extends RiotComponent> = {
  [K in keyof Object]: Object[K] extends (...args: infer Args) => infer Return
    ? (this: Component & Object, ...args: Args) => Return
    : Object[K]
}

export interface RiotComponent<
  Props extends DefaultProps = DefaultProps,
  State extends DefaultState = DefaultState,
> {
  // automatically generated on any component instance
  readonly props: Props
  readonly root: HTMLElement
  readonly name?: string
  readonly slots: TagSlotData[]

  // mutable state property
  state: State
  // optional alias to map the children component names
  components?: RiotComponentsMap

  mount(
    element: HTMLElement,
    initialState?: State,
    parentScope?: object,
  ): RiotComponent<Props, State>
  update(
    newState?: Partial<State>,
    parentScope?: object,
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
export type RiotComponentWithoutInternals<Component extends RiotComponent> =
  Omit<
    Component,
    | 'props'
    | 'root'
    | 'name'
    | 'slots'
    | 'mount'
    | 'update'
    | 'unmount'
    | '$'
    | '$$'
  >

//  Riot Pure Component interface that should be used together with riot.pure
export interface RiotPureComponent<Context = object> {
  mount(element: HTMLElement, context?: Context): void
  update(context?: Context): void
  unmount(keepRootElement: boolean): void
}

export interface PureComponentFactoryFunction<
  InitialProps extends DefaultProps = DefaultProps,
  Context = any,
> {
  ({
    slots,
    attributes,
    props,
  }: {
    slots?: TagSlotData<Context>[]
    attributes?: AttributeExpressionData<Context>[]
    props?: InitialProps
  }): RiotPureComponent<Context>
}

// This object represents the Output of the Riot compiler
export interface RiotComponentWrapper<Component> {
  readonly css?: string | null
  readonly exports?: RiotComponentFactoryFunction<Component> | Component | null
  readonly name?: string | null

  template?(
    template: (
      template: string,
      bindings?: BindingData<Component>[],
    ) => TemplateChunk<Component>,
    expressionTypes: Record<keyof typeof ExpressionType, number>,
    bindingTypes: Record<keyof typeof BindingType, number>,
    getComponent: TagBindingData['getComponent'],
  ): TemplateChunk<Component> | null
}

// Interface for components factory functions
export interface RiotComponentFactoryFunction<Component> {
  (...args: any[]): Component
  components?: RiotComponentsMap
}

// Riot public API
export declare function register<
  Props extends DefaultProps,
  State extends DefaultState,
>(
  componentName: string,
  wrapper: RiotComponentWrapper<RiotComponent<Props, State>>,
): RegisteredComponentsMap
export declare function unregister(
  componentName: string,
): RegisteredComponentsMap
export declare function mount<
  Props extends DefaultProps,
  State extends DefaultState,
>(
  selector: string | HTMLElement,
  initialProps?: Props,
  componentName?: string,
): RiotComponent<Props, State>[]
export declare function unmount(
  selector: string | HTMLElement,
  keepRootElement?: boolean,
): HTMLElement[]
export declare function install(plugin: ComponentEnhancer): InstalledPluginsSet
export declare function uninstall(
  plugin: ComponentEnhancer,
): InstalledPluginsSet
export declare function component<
  Props extends DefaultProps,
  State extends DefaultState,
  Component extends RiotComponent = RiotComponent<Props, State>,
>(
  wrapper: RiotComponentWrapper<Component>,
): (
  el: HTMLElement,
  initialProps?: Props,
  meta?: {
    slots: TagSlotData[]
    attributes: AttributeExpressionData[]
    parentScope: any
  },
) => Component

export declare function pure<
  InitialProps extends DefaultProps = DefaultProps,
  Context = any,
  FactoryFunction = PureComponentFactoryFunction<InitialProps, Context>,
>(func: FactoryFunction): FactoryFunction

export declare const version: string

// typescript specific methods

// Helper to infer the component object
type InferComponent<T> = T extends (...args: any[]) => infer C ? C : never

// Functional component instantiation
export declare function withTypes<
  Factory extends (...args: any[], Component = InferComponent<Factory>) => any,
  Component = InferComponent<Factory>,
  ComponentWithoutInternals = RiotComponentWithoutInternals<Component>,
>(
  factory: RiotComponentFactoryFunction<
    AutobindObjectMethods<ComponentWithoutInternals, RiotComponent>
  >,
): ReturnType<typeof factory>

//Static component objects
export declare function withTypes<
  Component,
  ComponentWithoutInternals = RiotComponentWithoutInternals<Component>,
>(
  component: AutobindObjectMethods<ComponentWithoutInternals, RiotComponent> & {
    // Prevent functions from matching,
    prototype?: never
  },
): typeof component

/**

 * Internal stuff exposed for advanced use cases
 * IMPORTANT:
 * The things exposed under __ are not part of the official API and might break at any time
 * Use it at your own risk!
 */

export interface CSSManager {
  CSS_BY_NAME: Map<string, string>
  add: (name: string, css: string) => CSSManager
  inject: () => CSSManager
  remove: (name: string) => CSSManager
}

export declare const __: {
  cssManager: CSSManager
  DOMBindings: {
    template: typeof template
    createBinding: typeof createBinding
    createExpression: typeof createExpression
    bindingTypes: typeof bindingTypes
    expressionTypes: typeof expressionTypes
  }
  globals: {
    PROPS_KEY: string
    STATE_KEY: string
    IS_COMPONENT_UPDATING: Symbol
    ATTRIBUTES_KEY_SYMBOL: Symbol
    PARENT_KEY_SYMBOL: Symbol
    DOM_COMPONENT_INSTANCE_PROPERTY: Symbol
    COMPONENTS_IMPLEMENTATION_MAP: RegisteredComponentsMap
    PLUGINS_SET: InstalledPluginsSet
  }
}
