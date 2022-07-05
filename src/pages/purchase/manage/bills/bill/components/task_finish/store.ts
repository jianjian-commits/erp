import { observable, action, computed, makeAutoObservable } from 'mobx';
import {
  ListPurchaseTask,
  PurchaseTask,
  PurchaseTask_Type,
} from 'gm_api/src/purchase'
import { GetManySkuResponse_SkuInfo, Ssu } from 'gm_api/src/merchandise'

type SsuSnaps = { [key: string]: Ssu }

class Store {
  list: (PurchaseTask & { sku: GetManySkuResponse_SkuInfo })[] = [];

  ssuSnaps: SsuSnaps = observable.object<SsuSnaps>({});

  selected: string[] = [];

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true });
  }

  setSelected(selected: string[]) {
    this.selected = selected
  }

  get purchaseTaskMap() {
    const map: { [key: string]: PurchaseTask } = {}
    this.list.forEach((v) => {
      const { sku, ...rest } = v
      map[v.purchase_task_id] = rest
    })
    return map
  }

  fetchList(ids: string[]) {
    return ListPurchaseTask({
      purchase_task_ids: ids,
      type: PurchaseTask_Type.COMMON,
      category_ids: [],
      supplier_ids: [],
      purchaser_ids: [],
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
