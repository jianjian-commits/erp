import { makeAutoObservable } from 'mobx'
import { ListCustomerUser } from 'gm_api/src/enterprise'

const PAGING = {
  offset: 0,
  limit: 999,
}
class Store {
  selectedValues = []

  constructor() {
    makeAutoObservable(this)
  }

  fetchListCustomerUser(customer_ids: string[]) {
    const req = { customer_ids, paging: { ...PAGING } }
    return ListCustomerUser(req).then((json) => {
      return json.response.customer_users
    })
  }
}

export default new Store()
