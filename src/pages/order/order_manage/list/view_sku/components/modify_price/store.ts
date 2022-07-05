import { observable, makeAutoObservable } from 'mobx'
import skuStore from '../../store'
import {
  ListOrderDetailGroupBySkuUnit,
  ListOrderDetailGroupBySkuUnitResponse_SkuUint,
} from 'gm_api/src/order'
import { Customer } from 'gm_api/src/enterprise'
import {
  GetSkuReferencePricesResponse_ReferencePrices,
  Quotation,
  Unit,
} from 'gm_api/src/merchandise'
import referenceMixin from '@/pages/order/order_manage/store/reference'

type CustomersMap = { [key: string]: Customer }
type QuotationsMap = { [key: string]: Quotation }

type Data = {
  price: number | null
  fee_unit_id: string
  unit: Unit
  parentUnit: Unit
} & ListOrderDetailGroupBySkuUnitResponse_SkuUint

class Store {
  list: Data[] = []

  customers: CustomersMap = observable.object<CustomersMap>({})

  quotations: QuotationsMap = observable.object<QuotationsMap>({})

  customer_quotation_relation = observable.object({})

  parent_child_quotation_id_map: Record<string, string> = {}

  /** 最近采购价|最近入库价 */
  priceOf: keyof GetSkuReferencePricesResponse_ReferencePrices =
    'purchase_reference_prices'

  reference = referenceMixin

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateRowItem<T extends keyof Data>(index: number, key: T, value: Data[T]) {
    this.list[index][key] = value
  }

  fetchList(ids: string[], isAll: boolean) {
    return ListOrderDetailGroupBySkuUnit({
      filter: {
        ...skuStore.getParams(),
        paging: { limit: 100 },
        detail_ids: !isAll ? ids : undefined,
      },
      relation_info: {
        need_customer_info: true,
        need_quotation_info: true,
        // 现在需要sku信息
        need_sku_info: true,
      },
      all: !!isAll,
    }).then((json) => {
      const {
        customers,
        quotations,
        sku_snaps,
        customer_quotation_relation,
        parent_child_quotation_id_map,
      } = json.response.relation_info!

      const sku_unit_data = json.response.sku_unit_data || []
      this.customers = customers || {}
      this.quotations = quotations || {}
      this.customer_quotation_relation = customer_quotation_relation || {}
      this.parent_child_quotation_id_map = parent_child_quotation_id_map || {}

      this.list = (sku_unit_data || []).map((v) => {
        let sku = {}
        for (const key in sku_snaps) {
          if (key.includes(v.sku_id!)) {
            sku = sku_snaps[key]
          }
        }
        const detail = v.orders![0].order_details?.order_details?.find(
          ({ sku_id, unit_id }) => sku_id === v.sku_id && unit_id === v.unit_id,
        )
        // 拿到定价单位，提交的时候用到
        const fee_unit_id = detail?.fee_unit_id!
        const units = detail?.unit_cal_info?.unit_lists
        const unit = units?.find((unit) => unit.unit_id === v.unit_id)!
        const parentUnit = units?.find(
          (parentUnit) => parentUnit.unit_id === unit?.parent_id,
        )!

        return { ...v, ...sku, unit, parentUnit, fee_unit_id, price: null }
      })
      return json
    })
  }
}

export default new Store()

export type { Data }
