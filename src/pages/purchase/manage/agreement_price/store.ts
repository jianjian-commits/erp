import { makeAutoObservable, toJS } from 'mobx'

class Store {
  tabActive = '1'

  constructor() {
    makeAutoObservable(this)
  }

  setTabActive(value: string) {
    this.tabActive = value
  }
}

export default new Store()
