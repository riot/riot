import {
  isObject,
  clear,
  defineProperty
} from './../common/util'

import Tag from './tag'

export default class LoopCache {
  constructor() {
    this._tagById = {}
    this._tagByValue = {}
    this._dubsFound = {}
  }

  setLink(tag, item) {
    if (isObject(item)) {
      let riotId = tag._riot_id

      this._tagById[riotId] = tag

      defineProperty(item, '_riot_id', riotId)
    } else {
      const list = this._tagByValue[item] || []

      list.push(tag)

      this._tagByValue[item] = list
    }
  }

  getLink(item) {
    if (isObject(item))
      return this._tagById[item._riot_id]

    const list = this._tagByValue[item]

    if (!list)
      return

    let count = this._dubsFound[item] || 0

    count++

    this._dubsFound[item] = count

    return list[count - 1]
  }

  clearLink(item) {
    if (isObject(item)) {
      delete this._tagById[item._riot_id]
      delete item._riot_id
    } else {
      const list = this._tagByValue[item] || []

      list.pop()

      if (!list.length)
        delete this._tagByValue[item]
    }
  }

  clearAll() {
    [this._tagById, this._tagByValue]
      .forEach(clear)
  }

  listLinks(items) {
    const result = items.map(this.getLink.bind(this))

    clear(this._dubsFound)
    return result
  }
}
