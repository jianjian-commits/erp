import { action, observable, makeAutoObservable } from 'mobx';

class DemoStore {
  name = '';

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true });
  }

  setName(name: string) {
    this.name = name
  }
}

export default new DemoStore()
