import { imageTypes } from '@/pages/merchandise/enum'
import { OrderTypesProps } from '@/pages/system/setting/order_setting/components/order_types'
import {
  CustomizeType,
  ListCustomizeType,
  SetCustomizeType,
} from 'gm_api/src/order'
import {
  GetOrderSettings,
  OrderSettings,
  OrderSettings_CombineRound,
  UpdateOrderSettings,
  OrderSettings_BshopDeleteOrder,
  OrderSettings_MergeOrder,
} from 'gm_api/src/preference'
import { makeAutoObservable } from 'mobx'
import { COMBINEROUND_CLOSE, COMBINEROUND_WHEN_BEFORE } from './enum'
interface OrderData extends Pick<OrderSettings, 'combine_round_method'> {
  combine_round_method: number
  combine_round_when: number
  bshop_edit_order: boolean
  bshop_delete_order: OrderSettings_BshopDeleteOrder
  merge_order: OrderSettings_MergeOrder
  order_types: CustomizeType[]
}
class OrderSettingStore {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  orderData: OrderData = {
    bshop_delete_order: OrderSettings_BshopDeleteOrder.BSHOPDELETEORDER_REJECT,
    bshop_edit_order: false,
    combine_round_method: COMBINEROUND_CLOSE,
    combine_round_when: COMBINEROUND_WHEN_BEFORE,
    // 默认erp和商城都开启
    merge_order: OrderSettings_MergeOrder.MERGEORDER_CLOSE,
    order_types: [],
  }

  changeDataItem<T extends keyof OrderData>(key: T, value: OrderData[T]) {
    this.orderData[key] = value
  }

  setOrderType(index: number, value: string) {
    this.orderData.order_types[index].name = value
  }

  async getCustomerType() {
    return ListCustomizeType().then(({ response }) => {
      this.orderData.order_types = response.customize_types
    })
  }

  updateCustomizeType(customize_types: { order_type: CustomizeType[] }) {
    return SetCustomizeType({
      customize_types: customize_types.order_type,
    })
  }

  getOrderSettings() {
    return GetOrderSettings().then((res) => {
      const { combine_round_method, ...rest } = res.response.order_settings
      const method = 1 << 3
      const when = 1 << 5
      const close =
        (combine_round_method! &
          OrderSettings_CombineRound.COMBINEROUND_CLOSE) ===
        1

      this.orderData = {
        ...this.orderData,
        ...rest,
        combine_round_method: close
          ? COMBINEROUND_CLOSE
          : Math.log(combine_round_method! & (method - 1)) / Math.log(2),
        combine_round_when: close
          ? COMBINEROUND_WHEN_BEFORE
          : Math.log(combine_round_method! & (when - method)) / Math.log(2),
      }
      return null
    })
  }

  updateOrderSettings() {
    const { combine_round_method, combine_round_when, ...rest } = this.orderData
    return UpdateOrderSettings({
      order_settings: {
        ...rest,
        combine_round_method: combine_round_method
          ? (1 << combine_round_method) + (1 << combine_round_when)
          : 1 << combine_round_method,
      } as OrderSettings,
    })
  }
}

export default new OrderSettingStore()
