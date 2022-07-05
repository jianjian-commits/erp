import {
  ListBillOrderByCustomer,
  ListBillOrderByOrderSource,
  ListBillOrderByProduct,
  ListBillOrderByOrderProduct,
} from 'gm_api/src/finance'
import _ from 'lodash'
import { TableType, TABLE_TYPE } from '../../config/data_to_key/table_type'
import { TableDataFetcherResult } from '../../interface'

export interface FetcherParams {
  /** 客户 id */
  customerId: string
  /** 时间筛选参数 */
  timeFilter?: {
    order_time_from_time?: string
    order_time_to_time?: string
    order_receive_from_time?: string
    order_receive_to_time?: string
    order_outstock_from_time?: string
    order_outstock_to_time?: string
  }
}

const fetcherMap = {
  [TABLE_TYPE.ORDERS]: async (params: FetcherParams) => {
    const { customerId, timeFilter } = params
    try {
      const res = await ListBillOrderByCustomer({
        list_bill_order_filter: {
          ...timeFilter,
          receive_customer_ids: [customerId],
        },
        // 接口暂不支持分页
        paging: undefined as any,
      })
      return res.response.bill_order_infos || []
    } catch (error) {
      return Promise.reject(error)
    }
  },
  [TABLE_TYPE.SKUS]: async (params: FetcherParams) => {
    const { customerId, timeFilter } = params
    try {
      const res = await ListBillOrderByOrderProduct({
        list_bill_order_filter: {
          ...timeFilter,
          receive_customer_ids: [customerId],
        },
      })
      return res.response.bill_order_product_infos || []
    } catch (error) {
      return Promise.reject(error)
    }
  },
  [TABLE_TYPE.PRODUCT]: async (params: FetcherParams) => {
    const { customerId, timeFilter } = params
    try {
      const res = await ListBillOrderByProduct({
        list_bill_order_filter: {
          ...timeFilter,
          receive_customer_ids: [customerId],
        },
      })
      return res.response.bill_order_product_infos || []
    } catch (error) {
      return Promise.reject(error)
    }
  },
  [TABLE_TYPE.ORDER_TYPE]: async (params: FetcherParams) => {
    const { customerId, timeFilter } = params
    try {
      const res = await ListBillOrderByOrderSource({
        list_bill_order_filter: {
          ...timeFilter,
          receive_customer_ids: [customerId],
        },
      })
      return res.response.bill_order_infos || []
    } catch (error) {
      return Promise.reject(error)
    }
  },
} as const

/**
 * 根据表格数据类型枚举获取数据
 */
async function getTableData(typeList: TableType[], params: FetcherParams) {
  try {
    const result: TableDataFetcherResult = {}
    const fetcherTask = _.map(typeList, (type) => {
      const fetcher = fetcherMap[type]
      return fetcher(params)
    })
    const resList = await Promise.all(fetcherTask)
    _.forEach(resList, (res, index) => {
      const key = typeList[index]
      result[key] = res
    })
    return result
  } catch (error) {
    return Promise.reject(error)
  }
}

export default getTableData
