import Big from 'big.js'
import {
  ListBillOrderByCustomer,
  BillOrderInfo,
  BillOrder_Type,
} from 'gm_api/src/finance'
import _ from 'lodash'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { SearchTimeParams } from '../../interface'
import { OrderSummaryItem } from '../interface'

export interface Options {
  /** 客户 id */
  customerId?: string
  /** 时间筛选参数 */
  timeFilter?: SearchTimeParams
}

function transformData(item: BillOrderInfo): OrderSummaryItem {
  const isAfterSaleOrder = item.type === BillOrder_Type.TYPE_AFTER_ORDER
  return {
    billOrderId: item.bill_order_id!,
    orderNumber: item.order_no,
    afterSaleNumber: item.after_sale_no,
    orderTime: isAfterSaleOrder
      ? moment(Number(item.after_sale_create_time)).format(
          'YYYY-MM-DD HH:mm:ss',
        )
      : moment(Number(item.order_time)).format('YYYY-MM-DD HH:mm:ss'),
    receivingTime: isAfterSaleOrder
      ? ''
      : moment(Number(item.receive_time)).format('YYYY-MM-DD HH:mm:ss'),
    businessType: item.type,
    orderType: item.customize_type_name,
    status: item.pay_after_state,
    amountPayable: isAfterSaleOrder
      ? '0.00'
      : Big(item.outstock_price || 0).toFixed(2),
    amountPaid: isAfterSaleOrder
      ? '0.00'
      : Big(item.paid_amount || 0).toFixed(2),
    outstandingAmount: isAfterSaleOrder
      ? '0.00'
      : Big(item.non_pay_amount || 0).toFixed(2),
    amountAfterSale: isAfterSaleOrder
      ? Big(item.order_after_sale_price || 0).toFixed(2)
      : '0.00',
  }
}

function useOrderData(options?: Options) {
  const { customerId, timeFilter } = options || {}

  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<OrderSummaryItem[]>()

  useEffect(() => {
    if (!customerId) {
      return
    }
    setLoading(true)
    ListBillOrderByCustomer({
      list_bill_order_filter: {
        ...timeFilter,
        receive_customer_ids: [customerId],
      },
      // 此接口分页数据无效，暂时不传
      paging: undefined as any,
    })
      .then(({ response }) => {
        const result = _.map(
          response.bill_order_infos,
          (item): OrderSummaryItem => {
            const newItem = transformData(item)
            const children = _.map(item.relation_bill_orders, transformData)
            if (!_.isEmpty(children)) {
              newItem.children = children
            }
            return newItem
          },
        )
        setList(result)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [customerId, timeFilter])

  return { data: list, loading }
}

export default useOrderData
