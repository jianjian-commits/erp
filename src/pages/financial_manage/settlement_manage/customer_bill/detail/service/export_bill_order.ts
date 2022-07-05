import { ExportBillOrder } from 'gm_api/src/finance'
import { OrderExportSettings_Type } from 'gm_api/src/preference'
import { SearchTimeParams } from '../interface'

export interface Options {
  /** 客户 id */
  customerId: string
  /** 时间筛选参数 */
  timeFilter?: SearchTimeParams
  /** 导出类型 */
  type: OrderExportSettings_Type
}

/**
 * 导出客户账单
 */
async function exportBillOrder(options: Options) {
  const { customerId, timeFilter, type } = options

  try {
    await ExportBillOrder({
      list_bill_order_filter: {
        ...timeFilter,
        receive_customer_ids: [customerId],
      },
      type,
    })
    // globalStore.showTaskPanel('0')
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

export default exportBillOrder
