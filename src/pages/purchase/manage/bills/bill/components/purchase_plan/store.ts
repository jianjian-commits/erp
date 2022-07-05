import { observable, action, makeAutoObservable } from 'mobx'
import moment from 'moment'
import {
  ListPurchaseTask,
  TimeType,
  PurchaseTask_Type,
  PurchaseTask_Status,
  PurchaseTask,
} from 'gm_api/src/purchase'
import { GetManySkuResponse_SkuInfo, Ssu } from 'gm_api/src/merchandise'

interface F {
  begin: Date | null
  end: Date | null
  q: string
}

type SsuSnaps = { [key: string]: Ssu }

class Store {
  filter: F = {
    begin: moment().startOf('day').toDate(),
    end: moment().endOf('day').toDate(),
    q: '',
  }

  list: (PurchaseTask & { sku: GetManySkuResponse_SkuInfo })[] = []

  ssuSnaps: SsuSnaps = observable.object<SsuSnaps>({})

  selected: string[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setSelected(selected: string[]) {
    this.selected = selected
  }

  updateFilter<T extends keyof F>(key: T, value: F[T]) {
    this.filter[key] = value
  }

  init() {
    this.selected = []
    this.list = []
  }

  fetchList(sku_id?: string) {
    return ListPurchaseTask({
      serial_no: this.filter.q || undefined,
      status: PurchaseTask_Status.RELEASED,
      begin_time: `${+this.filter.begin!}`,
      end_time: `${+this.filter.end!}`,
      filter_time_type: TimeType.PURCHASE_TIME,
      type: PurchaseTask_Type.COMMON,
      category_ids: [],
      supplier_ids: [],
      purchaser_ids: [],
      sku_id: sku_id || undefined,
      paging: {
        limit: 999,
      },
    }).then((json) => {
      const task = json.response.purchase_tasks! || []
      this.ssuSnaps = json.response.ssu_snaps || {}
      this.list = task.map((v) => {
        return {
          ...v,
          sku: json.response.skus[v.sku_id],
        }
      })
      return json.response
    })
  }
}

export default new Store()
export type { F }
