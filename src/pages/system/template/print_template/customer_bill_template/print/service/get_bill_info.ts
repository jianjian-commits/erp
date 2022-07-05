import { t } from 'gm-i18n'
import { ListBillOrder } from 'gm_api/src/finance'
import _ from 'lodash'

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

/**
 * 获取 header 部分展示数据
 */
async function getBillInfo(params: FetcherParams) {
  const { customerId, timeFilter } = params
  try {
    const { response } = await ListBillOrder({
      list_bill_order_filter: {
        ...timeFilter,
        receive_customer_ids: [customerId],
      },
      paging: { limit: 10, offset: 0 },
    })
    if (_.isEmpty(response.bill_order_infos)) {
      return Promise.reject(Error(t('数据错误，未获取到该客户')))
    }
    const target = response.bill_order_infos![0]
    return target
  } catch (error) {
    return Promise.reject(error)
  }
}

export default getBillInfo
