import { makeAutoObservable } from 'mobx'
import Big from 'big.js'
import _ from 'lodash'
import { OrderInfo, ServicePeriod, DetailListItem } from '../interface'
import { initSsu } from '../init'
import { toFixedOrder } from '@/common/util'
import {
  UploadOrderTempleteResponse_Customer,
  UploadOrderTempleteResponse_ExcelOrder,
} from 'gm_api/src/orderlogic'
import {
  wrapOrderDetail,
  mergeOrderDetails,
} from '@/pages/order/order_manage/components/detail/util'
import { OrderDetail } from 'gm_api/src/order'
import { isCombineSku } from '@/pages/order/util'
import { UnitValueSetV2 } from 'gm_api/src/merchandise'

type Info = Omit<OrderInfo, 'view_type' | 'repair'>
type Detail = DetailListItem
type Order = {
  info: Info
  excel?: {
    customer?: UploadOrderTempleteResponse_Customer
    excelOrder?: UploadOrderTempleteResponse_ExcelOrder
  }
  list: Detail[]
}

class Store {
  list: Order[] = []
  servicePeriod?: ServicePeriod = undefined

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  get summary() {
    const { list } = this
    return list.map((order) => {
      const { list } = order
      const result = list
        .filter((item) => !item.parentId)
        .reduce(
          (sum, v) => {
            return {
              orderPrice: Big(sum.orderPrice).add(
                Big(+v.quantity! || 0).times(Big(+v.price! || 0)),
              ),
            }
          },
          { orderPrice: Big(0) },
        )
      return toFixedOrder(result.orderPrice)
    })
  }

  getList(list: any[]) {
    return _.flatMap(list, (item) => {
      if (item?.ingredientsInfo?.length > 0) {
        return [item, ...item.ingredientsInfo]
      }
      return [item]
    })
  }

  init() {
    this.list = []
    this.servicePeriod = undefined
  }

  setBatchOrders(batch: Order[], sp: ServicePeriod) {
    this.list = batch
    this.servicePeriod = sp
  }

  addSsuRow(orderIndex: number, ssu: Detail = initSsu, ssuIndex?: number) {
    if (_.isNil(ssuIndex)) ssuIndex = this.list[orderIndex].list.length
    this.list[orderIndex].list.splice(ssuIndex + 1, 0, { ...ssu })
  }

  deleteSsuRow(orderIndex: number, ssuIndex: number) {
    const length = this.list[orderIndex].list.length
    if (length === 1 && ssuIndex === 0) {
      this.updateSsuRow(orderIndex, ssuIndex, { ...initSsu })
    } else {
      const deleteLength =
        this.list[orderIndex].list[ssuIndex]?.ingredientsInfo?.length || 0
      this.list[orderIndex].list.splice(ssuIndex, deleteLength + 1)
    }
  }

  updateSsuRow(orderIndex: number, ssuIndex: number, ssu: Detail) {
    this.list[orderIndex].list[ssuIndex] = ssu
  }

  updateSsuRowItem<T extends keyof Detail>(
    orderIndex: number,
    ssuIndex: number,
    key: T,
    value: Detail[T],
  ) {
    this.list[orderIndex].list[ssuIndex][key] = value
  }

  updateOrderRowItem<T extends keyof Info>(
    orderIndex: number,
    key: T,
    value: Info[T],
  ) {
    this.list[orderIndex].info[key] = value
  }

  /** 修改加单数 */
  updateAddOrderValue(
    orderIndex: number,
    index: number,
    key: keyof Detail,
    value?: string | number,
  ) {
    const item = this.list[orderIndex].list[index]
    if (!item) {
      return
    }
    const target = (item[key] as UnitValueSetV2) || {}
    this.updateSsuRowItem(orderIndex, index, key, {
      ...target,
      quantity: {
        unit_id: item.unit_id || '',
        ...target?.quantity,
        val: _.isNil(value) ? '' : `${value}`,
      },
    })
  }

  deleteOrderRow(orderIndex: number) {
    this.list.splice(orderIndex, 1)
  }

  getParams(index: number) {
    const order = this.list[index]
    const { info, list } = order

    /**
     * 如果新建订单的时候不包含组合商品，order_details不合并，order_raw_details与order_details保持一致
     * 如果包含组合商品，order_details合并
     */
    const order_details = list.find((ssu) => isCombineSku(ssu))
      ? mergeOrderDetails(
          wrapOrderDetail(
            list.filter((v) => v.sku_id && v.unit_id && !isCombineSku(v)),
            'orderDetail',
            false,
          ) as OrderDetail[],
        )
      : wrapOrderDetail(
          list.filter((v) => v.sku_id && v.unit_id && !v.parentId),
          'orderDetail',
          false,
        )
    return {
      order_id: '0',
      bill_customer_id: info.bill_customer_id,
      receive_customer_id: info.receive_customer_id,
      service_period: info.service_period,
      receive_time: info.receive_time,
      remark: info.remark,
      app_type: info.app_type,
      addresses: info.addresses,
      time_zone: info.time_zone,
      /**
       * Order去掉quotation_id字段
       */
      // quotation_id: info.quotation_id,
      // order_raw_details,所有下单商品，不包括组合商品的原料
      order_raw_details: {
        order_details: wrapOrderDetail(
          list.filter((v) => v.sku_id && v.unit_id && !v.parentId),
          'orderRawDetail',
          false,
        ),
      },
      order_details: {
        order_details: _.map(order_details, (item) =>
          _.omit(item, 'outstock_unit_value_v2'),
        ),
      },
    }
  }

  /**
   * 重置加单数
   * 修改下单单位后需要重置加单数
   */
  resetAddOrderValue(orderIndex: number, index: number) {
    this.updateSsuRowItem(orderIndex, index, 'add_order_value1', undefined)
    this.updateSsuRowItem(orderIndex, index, 'add_order_value2', undefined)
    this.updateSsuRowItem(orderIndex, index, 'add_order_value3', undefined)
    this.updateSsuRowItem(orderIndex, index, 'add_order_value4', undefined)
  }
}

export { initSsu }
export default new Store()
export type { Order as BatchOrder, Info, Detail }
