import { observable, action, makeAutoObservable } from 'mobx'
import moment from 'moment'
import {
  GetPurchaseTask,
  GetPurchaseTaskResponse,
  TimeType,
  PurchaseTask_Type,
  PurchaseTask_Status,
  PurchaseTask_RequestSource,
} from 'gm_api/src/purchase'
import globalStore from '@/stores/global'
import { toFixed } from '@/common/util'
import _ from 'lodash'
import { List } from '../../interface'

class Store {
  list: List[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  resetData() {
    this.list = []
  }

  sortListData(res: GetPurchaseTaskResponse): List[] {
    const task = res.purchase_task
    const skuSnaps = res.sku_map
    const customers = res.customers
    const _list = (task?.request_details?.request_details || [])
      .filter(
        (v) =>
          _.get(v, 'request_source', PurchaseTask_RequestSource.UNSPECIFIED) ===
          PurchaseTask_RequestSource.ORDER,
      )
      .map((v, index) => {
        const sku = skuSnaps[`${task.sku_id}`] || {}
        const unit_name =
          +v?.val?.input?.unit_id! > 10000
            ? globalStore.getUnitName(v?.val?.input?.unit_id!)
            : globalStore.getPurchaseUnitName(
                sku.units?.units,
                v?.val?.input?.unit_id!,
              )
        const levelName =
          _.find(
            sku?.sku_level?.sku_level!,
            (i) => i.level_id === task.sku_level_filed_id,
          )?.name || '-'
        return {
          ...v,
          ...sku,
          unit_name,
          // 预采购删除用，因为预采购显示的list是过滤后的data
          _index: index,
          need: toFixed(+v?.val?.input?.quantity! || 0),
          customer_name: customers[v.customer_id!]?.name || '-',
          levelName,
        }
      })
    return _list
  }

  getPurchaseTask(purchase_task_id: string) {
    return GetPurchaseTask({ purchase_task_id }).then((res) => {
      this.list = this.sortListData(res.response)
      return res.response
    })
  }
}

export default new Store()
