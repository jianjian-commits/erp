import { t } from 'gm-i18n'
import { ReceiptStatusAll, ObjectOfKey } from './interface'
import _ from 'lodash'
import { Order_State } from 'gm_api/src/order'
import {
  AfterSaleOrderDetail_Reason,
  AfterSaleOrderDetail_Method,
  AfterSaleOrder_Status,
  AfterSaleOrderDetail_TaskMethod,
  AfterSaleOrderDetail_Type,
} from 'gm_api/src/aftersale'

export function parseSelectData(m: { [key: number]: string }) {
  return _.map(m, (text, value) => {
    return {
      value: +value,
      text: text,
    }
  }).filter((v) => v.text)
}

export const ORDER_STATUS = [
  { value: Order_State.STATE_UNSPECIFIED, text: t('全部状态') },
  { value: Order_State.STATE_WAITING_SORT, text: t('待分拣') },
  { value: Order_State.STATE_SORTING, text: t('分拣中') },
  { value: Order_State.STATE_DELIVERYING, text: t('配送中') },
  { value: Order_State.STATE_RECEIVABLE, text: t('已签收') },
]
// 订单状态
export const ORDER_STATUS_MAP: ObjectOfKey<string> = {
  [Order_State.STATE_WAITING_SORT]: t('待分拣'),
  [Order_State.STATE_SORTING]: t('分拣中'),
  [Order_State.STATE_DELIVERYING]: t('配送中'),
  [Order_State.STATE_RECEIVABLE]: t('已签收'),
}

// 售后原因
export const AFTER_SALES_REASON_MAP: ObjectOfKey<string> = {
  [AfterSaleOrderDetail_Reason.REASON_NOT_DELIVERED_ON_TIME]: t('未按时送达'),
  [AfterSaleOrderDetail_Reason.REASON_MISSED_ORDERS]: t('漏单'),
  [AfterSaleOrderDetail_Reason.REASON_SEND_THE_WRONG_ITEM]: t('送错货品'),
  [AfterSaleOrderDetail_Reason.REASON_WRONG_ORDER]: t('下单错'),
  [AfterSaleOrderDetail_Reason.REASON_WEIGHT_WRONG]: t('斤两不对（用户发现）'),
  [AfterSaleOrderDetail_Reason.REASON_QUALITY_ISSUES]: t('质量问题'),
  [AfterSaleOrderDetail_Reason.REASON_SPECIFICATION_ISSUE]: t('规格问题'),
  [AfterSaleOrderDetail_Reason.REASON_DRIVER_LOST_OR_BROKEN]:
    t('司机弄坏/弄丢'),
  [AfterSaleOrderDetail_Reason.REASON_OUT_OF_STOCK_IN_THE_MARKET]:
    t('市场缺货（未出库）'),
  [AfterSaleOrderDetail_Reason.REASON_SYSTEM_PROBLEMS]: t('系统问题'),
  [AfterSaleOrderDetail_Reason.REASON_PROCUREMENT_ISSUES]: t('采购问题'),
  [AfterSaleOrderDetail_Reason.REASON_UNDELIVERABLE]: t('无法送达'),
  [AfterSaleOrderDetail_Reason.REASON_OTHER]: t('其他'),
}

// 售后方式
export const AFTER_SALES_WAY_MAP: ObjectOfKey<string> = {
  [AfterSaleOrderDetail_Method.METHOD_GOODS_REDUCTION]: t('货品减免'),
  [AfterSaleOrderDetail_Method.METHOD_REPLENISHMENT]: t('补货'),
  [AfterSaleOrderDetail_Method.METHOD_EXCHANGE]: t('换货'),
  [AfterSaleOrderDetail_Method.METHOD_BILLING]: t('核算账单'),
  [AfterSaleOrderDetail_Method.METHOD_CUSTOMER_COMMUNICATE]: t('客户沟通'),
  [AfterSaleOrderDetail_Method.METHOD_METHOD_OTHER]: t('其他'),
}

// 处理方式
export const AFTER_SALES_TASK_METHOD: ObjectOfKey<string> = {
  [AfterSaleOrderDetail_TaskMethod.TASK_METHOD_UNSPECIFIED]: t('未指定方式'),
  [AfterSaleOrderDetail_TaskMethod.TASK_METHOD_PICK_UP]: t('取货'),
  [AfterSaleOrderDetail_TaskMethod.TASK_METHOD_GIVE_UP_PICKUP]: t('放弃取货'),
}

// 售后状态
export const AfterSale_Status: ObjectOfKey<string> = {
  [AfterSaleOrder_Status.STATUS_UNSPECIFIED]: t('-'),
  [AfterSaleOrder_Status.STATUS_TO_SUBMIT]: t('待提交'),
  [AfterSaleOrder_Status.STATUS_TO_REVIEWED]: t('待审核'),
  [AfterSaleOrder_Status.STATUS_TO_RETURNED]: t('待退货'),
  [AfterSaleOrder_Status.STATUS_TO_REFUND]: t('待退款'),
  [AfterSaleOrder_Status.STATUS_REFUNDED]: t('已退款'),
}

export const AFTER_SALES_REASON = parseSelectData(AFTER_SALES_REASON_MAP)
export const AFTER_SALES_WAY = parseSelectData(AFTER_SALES_WAY_MAP)

export const MERCHANTS_LABEL = [{ value: 0, text: t('全部') }]

export const RECEIPT_TABS: ReceiptStatusAll<string> = {
  all: t('全部'),
  toBeSubmitted: t('待提交'),
  submittedIncomplete: t('待审核'),
  reviewed: t('待退货'),
  deleted: t('待退款'),
  completed: t('已退款'),
}

// 售后类型
export const AfterSaleType = [
  { value: AfterSaleOrderDetail_Type.TYPE_REFUND, text: t('仅退款') },
  { value: AfterSaleOrderDetail_Type.TYPE_REFUND_RETURN, text: t('退货退款') },
]

export const LiteAfterSaleType = [
  { value: AfterSaleOrderDetail_Type.TYPE_REFUND, text: t('仅退款') },
]
