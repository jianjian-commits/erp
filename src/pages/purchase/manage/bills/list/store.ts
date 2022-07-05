import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import { ListPurchaseSheet, PurchaseSheet_Status } from 'gm_api/src/purchase'
import type { MoreSelectDataItem } from '@gm-pc/react'
import type { PurchaseSheet } from '../../../interface'
import { TimeType } from 'gm_api/src/inventory'
import { SourceEnum, APP_TYPE_ENUM } from '../../../enum'
interface F {
  begin: Date
  end: Date
  time_type: number
  q: string
  status: PurchaseSheet_Status
  suppliers: MoreSelectDataItem[]
  source: SourceEnum
  purchaser_ids: MoreSelectDataItem[]
  dateType: number
}

const initFilter: F = {
  begin: moment().startOf('day').toDate(),
  end: moment().endOf('day').toDate(),
  time_type: TimeType.TIME_TYPE_CREATE,
  q: '',
  status: 0,
  suppliers: [],
  source: 0,
  purchaser_ids: [],
  dateType: 1,
}

class Store {
  list: PurchaseSheet[] = []

  filter: F = { ...initFilter }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  doRequest = () => {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  resetFilter() {
    this.filter = { ...initFilter }
  }

  updateFilter<T extends keyof F>(key: T, value: F[T]) {
    this.filter[key] = value
  }

  fetchList(params?: any) {
    const source = this.filter.source
    return ListPurchaseSheet(
      Object.assign(
        {
          serial_no: this.filter.q,
          supplier_ids: this.filter.suppliers.map((v) => v.value),
          purchaser_ids: this.filter.purchaser_ids.map((v) => v.value),
          status: this.filter.status || undefined,
          begin_time: `${+this.filter.begin}`,
          end_time: `${+this.filter.end}`,
          time_type: this.filter.time_type,
          /** 根据后端要求: “
            erp这里
            如果app_type 为1或0、source 为1就是手工新建
            app_type为7 source为1就是采购小程序
            source 为2采购计划
            搜索相反 ”
           * **/
          source: source === 3 ? 1 : source,
          app_type: APP_TYPE_ENUM[source],
        },
        params,
      ),
    ).then((json) => {
      const groupUser = json.response.group_users || {}
      const suppliers = json.response.suppliers || {}
      this.list = (json.response.purchase_sheets || []).map((v) => ({
        ...v,
        creator: groupUser[v.creator_id!],
        purchaser: groupUser[v.purchaser_id!],
        supplier: suppliers[v.supplier_id!],
      }))
      return json.response
    })
  }

  setDoRequest(func: () => void) {
    this.doRequest = func
  }
}

export default new Store()

export type { F }
