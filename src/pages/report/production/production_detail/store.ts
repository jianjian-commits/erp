import { makeObservable } from 'mobx'
import BaseStore from '../base.store'

class Store extends BaseStore {
  constructor() {
    super()
    makeObservable(this, {})
  }
}

export default new Store()
