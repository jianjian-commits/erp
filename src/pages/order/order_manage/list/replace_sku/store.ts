import { Quotation, Sku_SkuType } from 'gm_api/src/merchandise'
import { Customer } from 'gm_api/src/enterprise'
import {
  ListOrderDetailGroupBySkuUnit,
  ListOrderDetailGroupBySkuUnitRequest,
  Order,
} from 'gm_api/src/order'
import { makeAutoObservable, observable } from 'mobx'
import _ from 'lodash'
import { BatchUpdateOrderSsuRequest_UpdateData } from 'gm_api/src/orderlogic'
import { Sku } from '@/pages/order/order_manage/components/interface'
import { ListDataItem } from '@gm-pc/react'
export interface SkuWithSelectItem extends Sku {
  value: string
  text: string
  orders: Order[]
}

export type ResponseSku = SkuWithSelectItem & {
  replaceUnitId?: string
  replaceUnitList?: ListDataItem<string>[] | undefined
  replaceSsu: SkuWithSelectItem
}
type CustomersMap = { [key: string]: Customer }
type QuotationsMap = { [key: string]: Quotation }
class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  customers: CustomersMap = observable.object<CustomersMap>({})

  quotations: QuotationsMap = observable.object<QuotationsMap>({})

  list: ResponseSku[] = []

  fetchGroupSku(query: ListOrderDetailGroupBySkuUnitRequest) {
    return ListOrderDetailGroupBySkuUnit(query).then((json) => {
      this.customers = json.response.relation_info?.customers || {}
      this.quotations = json.response.relation_info?.quotations || {}
      const sku_snaps = json.response.relation_info?.sku_snaps
      this.list = _.map(json.response.sku_unit_data || [], (v) => {
        let sku = {}
        for (const key in sku_snaps) {
          if (key.includes(v.sku_id!)) {
            sku = sku_snaps[key]
          }
        }

        return {
          ...v,
          ...sku,
          replaceSsu: undefined,
        }
      })
      return json
    })
  }

  updateRow(
    index: number,
    sku: SkuWithSelectItem,
    replaceUnitList?: ListDataItem<string>[] | undefined,
    replaceUnitId?: string,
  ) {
    this.list[index].replaceSsu = sku

    if (sku.sku_type === Sku_SkuType.NOT_PACKAGE) {
      this.list[index].replaceUnitList = replaceUnitList
      this.list[index].replaceUnitId = replaceUnitId
    }
  }

  updateSkuList(newSkuList: ResponseSku[]) {
    this.list = newSkuList
  }

  getReplaceParams(type: string) {
    const updates: BatchUpdateOrderSsuRequest_UpdateData[] = []
    _.each(this.list, (v) => {
      if (v.replaceSsu) {
        updates.push({
          origin_ssu_id: { sku_id: v.sku_id!, unit_id: v.unit_id! },
          replace_ssu_id: {
            sku_id: v.replaceSsu?.sku_id!,
            unit_id:
              type === 'combine' ? v.replaceSsu?.unit_id! : v.replaceUnitId!,
          },
          order_ids: _.map(v.orders, (o) => o.order_id),
        })
      }
    })
    return updates
  }
}

export default new Store()
