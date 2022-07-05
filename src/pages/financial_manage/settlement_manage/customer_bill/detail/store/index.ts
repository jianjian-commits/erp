import { makeAutoObservable } from 'mobx'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { ListBillOrder, ListBillOrderRequest } from 'gm_api/src/finance'
import _ from 'lodash'
import { BillInfo } from '../interface'

type GetBillInfoParams = Pick<
  NonNullable<ListBillOrderRequest['list_bill_order_filter']>,
  | 'order_receive_from_time'
  | 'order_receive_to_time'
  | 'order_time_from_time'
  | 'order_time_to_time'
  | 'order_outstock_from_time'
  | 'order_outstock_to_time'
> & {
  customerId: string
}

/**
 * 客户账单详情页 store
 *
 * 此 store 不应该存储过多数据，仅作为 header 部分以及公共参数存储。
 */
class CustomerBillDetailStore {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /**
   * 账单信息（详情页 header 部分）
   */
  billInfo: BillInfo = {
    customerId: '',
  }

  setBillInfo(value: BillInfo) {
    this.billInfo = value
  }

  /**
   * 获取 header 部分展示数据
   */
  async getBillInfo(params: GetBillInfoParams) {
    const { customerId, ...timeParams } = params
    try {
      const { response } = await ListBillOrder({
        list_bill_order_filter: {
          ...timeParams,
          receive_customer_ids: [customerId],
        },
        paging: { limit: 10, offset: 0 },
      })
      if (_.isEmpty(response.bill_order_infos)) {
        Tip.danger(t('数据错误，未获取到该客户'))
        return
      }
      const target = response.bill_order_infos![0]
      this.setBillInfo({
        customerName: target.customer_name,
        customerId: target.customer_id!,
        customerCode: target.customized_code,
        amountPayable: target.outstock_price || '',
        amountPaid: target.paid_amount || '',
        outstandingAmount: target.non_pay_amount || '',
        amountAfterSale: target.order_after_sale_price || '',
        amountToBeSettled: target.non_settlement_amount || '',
      })
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  clear() {
    this.setBillInfo({
      customerId: '',
    })
  }
}

export default new CustomerBillDetailStore()
