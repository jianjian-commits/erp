import { BillOrderInfo, ListBillOrderByOrderSource } from 'gm_api/src/finance'
import _ from 'lodash'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { SearchTimeParams } from '../../interface'
import { OrderTypeSummaryItem } from '../interface'

export interface Options {
  /** 客户 id */
  customerId?: string
  /** 时间筛选参数 */
  timeFilter?: SearchTimeParams
}

function transformData(item: BillOrderInfo): OrderTypeSummaryItem {
  const customizeOrderType: OrderTypeSummaryItem['customizeOrderType'] = {}

  _.forOwn(item.relation_customize_type || {}, (customizeType) => {
    customizeOrderType[customizeType.customize_type_id!] = {
      orderAmount: customizeType.order_price,
      outstockAmount: customizeType.outstock_price,
    }
  })

  return {
    id: item.bill_order_id,
    orderDate: moment.unix(Number(item.order_time)).format('YYYY-MM-DD'),
    totalOrderAmount: item.order_price,
    totalOutstockAmount: item.outstock_price,
    customizeOrderType,
  }
}

function useOrderTypeData(options?: Options) {
  const { customerId, timeFilter } = options || {}

  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<OrderTypeSummaryItem[]>()

  useEffect(() => {
    if (!customerId) {
      return
    }
    setLoading(true)
    ListBillOrderByOrderSource({
      list_bill_order_filter: {
        ...timeFilter,
        receive_customer_ids: [customerId],
      },
    })
      .then(({ response }) => {
        const result = _.map(response.bill_order_infos, transformData)
        setList(result)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [customerId, timeFilter])

  return { data: list, loading }
}

export default useOrderTypeData
