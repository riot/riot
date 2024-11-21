import { AutobindObjectMethods, RiotComponent } from '../../riot'

type BaseObject = {
  method(example: number): boolean
}
type ThisObject = RiotComponent<
  {
    prop: string
  },
  {
    stateProp: number
  }
>
type BoundObject = AutobindObjectMethods<BaseObject, ThisObject>

export const object: BoundObject = {
  // this method is correctly implemented
  method(example) {
    // check also if this is correctly inferred
    this.onBeforeMount != null
    return example > 12
  },
}
export const object2: BoundObject = {
  /**
   * The following implementation will throw
   * an error because of the wrong arg type
   */
  //@ts-expect-error
  method(example: string) {
    return example != ''
  },
}
