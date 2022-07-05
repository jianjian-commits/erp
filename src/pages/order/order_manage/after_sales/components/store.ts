import { observable, action, makeAutoObservable } from 'mobx';

interface ExpendedMap {
  [key: number]: boolean
}
class Store {
  list = [];

  expanded: ExpendedMap = { 0: false };

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true });
  }

  setExpanded(expanded: ExpendedMap) {
    this.expanded = expanded
  }
}

export default new Store()
