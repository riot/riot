// This interface is only exposed and any Riot component will receive the following properties
export interface RiotCoreComponent {
  // automatically generated on any component instance
  readonly props: object
  readonly root: HTMLElement
  readonly name?: string
  // TODO: add the @riotjs/dom-bindings types
  readonly slots: any[]
  mount(
    element: HTMLElement,
    initialState?: object,
    parentScope?: object
  ): RiotComponent
  update(
    newState?: object,
    parentScope?: object
  ): RiotComponent
  unmount(keepRootElement: boolean): RiotComponent

  // Helpers
  $(selector: string): HTMLElement
  $$(selector: string): [HTMLElement]
}

export interface RiotComponentShell {
  readonly css?: string
  readonly exports?: () => RiotComponent|object
  readonly name?: string
  // TODO: add the @riotjs/dom-bindings types
  template(): any
}

// All the RiotComponent Public interface properties are optional
export interface RiotComponent extends RiotCoreComponent {
  // optional on the component object
  state?: object

  // optional alias to map the children component names
  components?: {
    [key: string]: RiotComponentShell
  }

  // state handling methods
  shouldUpdate?(newProps: object, currentProps: object): boolean

  // lifecycle methods
  onBeforeMount?(currentProps: object, currentState: object): void
  onMounted?(currentProps: object, currentState: object): void
  onBeforeUpdate?(currentProps: object, currentState: object): void
  onUpdated?(currentProps: object, currentState: object): void
  onBeforeUnmount?(currentProps: object, currentState: object): void
  onUnmounted?(currentProps: object, currentState: object): void
}

export type RegisteredComponentsMap = Map<string, () => RiotComponent>
export type ComponentEnhancer = (component: RiotComponent) => RiotComponent
export type InstalledPluginsSet = Set<ComponentEnhancer>

export function register(componentName: string, shell: RiotComponentShell): RegisteredComponentsMap
export function unregister(componentName: string): RegisteredComponentsMap
export function mount(selector: string, componentName: string, initialProps?: object): RiotComponent[]
export function unmount(selector: string):HTMLElement[]
export function install(plugin: ComponentEnhancer):InstalledPluginsSet
export function uninstall(plugin: ComponentEnhancer):InstalledPluginsSet
export function component(shell: RiotComponentShell):(el: HTMLElement, initialProps?: object) => RiotComponent
export const version: string
