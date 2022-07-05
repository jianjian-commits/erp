import { makeAutoObservable } from 'mobx'
import {
  GetAdvancedOrder,
  AdvancedOrder,
  RefundAdvancedOrder,
} from 'gm_api/src/eshop'

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  advanced_order: AdvancedOrder = {
    advanced_order_id: '0',
  }

  getDetail(advanced_order_id: string) {
    return GetAdvancedOrder({ advanced_order_id }).then((json) => {
      this.advanced_order = json.response.advanced_order
    })
  }

  refun(advanced_order_id: string) {
    return RefundAdvancedOrder({ advanced_order_id })
  }
}

export default new Store()
