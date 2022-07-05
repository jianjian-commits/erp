import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import {
  ListCustomerTurnover,
  ExportCustomerTurnover,
} from 'gm_api/src/inventory'
import {
  TableRequestParams,
  CustomerTurnoverExpand,
  CustomerTurnoverStock,
} from '@/pages/sales_invoicing/interface'
import { getTurnoverAdditional } from '@/pages/sales_invoicing/util'
import return_store from '../../loan_and_return_log/stores/return_store'
import { FtTurn } from '../../interface'

class Store {
  filter: FtTurn = {
    with_additional: true,
    q: '',
    warehouse_id: '',
  }

  list: CustomerTurnoverExpand[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  export() {
    const { warehouse_id } = this.filter
    return ExportCustomerTurnover({
      list_customer_turnover_request: {
        warehouse_id,
        q: this.filter.q,
        paging: {
          limit: 0,
        },
      },
    })
  }

  changeFilter<T extends keyof FtTurn>(key: T, value: FtTurn[T]) {
    this.filter[key] = value
  }

  getSearchList(data: TableRequestParams) {
    const { warehouse_id } = this.filter
    const req = Object.assign(
      {
        ...this.filter,
        warehouse_id: warehouse_id || undefined,
      },
      { paging: data.paging },
    )

    return ListCustomerTurnover(req).then((json) => {
      const { customer_turnover, additional } = json.response
      this.list = getTurnoverAdditional(customer_turnover, additional!)
      return json.response
    })
  }

  changeSheet(data: CustomerTurnoverStock) {
    const { sku_id, customer_id, customer_info, base_unit, skuInfo } = data
    // 获取与moreSelect相同的数据结构
    // listSku返回的ssu_infos结构为数组
    const skuExpand = skuInfo.sku
    skuExpand!.ssu_infos = _.toArray(skuInfo.ssu_map)
    return return_store.updateReturnSheet({
      customer: { value: customer_id!, text: customer_info.name },
      sku: { value: sku_id, text: skuExpand.name, original: skuExpand },
      quantity: +base_unit!.quantity!,
      group_user_id: '0',
      base_unit_name: '-',
      max: +base_unit!.quantity!,
    })
  }
}

export default new Store()
