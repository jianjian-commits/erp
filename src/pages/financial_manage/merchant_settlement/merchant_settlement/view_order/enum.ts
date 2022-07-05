import { t } from 'gm-i18n'
import _ from 'lodash'
import { ObjectOfKey } from '../../interface'
import { CreditType } from 'gm_api/src/enterprise'
import { parseSelectData } from '../../utils'
import {
  map_Order_PayState,
  map_Order_State,
  map_SortingStatus,
  Order_OrderOp,
  Order_PayState,
  Order_State,
  SortingStatus,
} from 'gm_api/src/order'
import { App_Type } from 'gm_api/src/common'

export const CreditTypeMap: ObjectOfKey<string> = {
  [CreditType.CREDIT_TYPE_UNSPECIFIED]: t('全部'),
  [CreditType.CREDIT_TYPE_DAILY]: t('日结'),
  [CreditType.CREDIT_TYPE_WEEKLY]: t('周结'),
  [CreditType.CREDIT_TYPE_MONTHLY]: t('月结'),
  [CreditType.CREDIT_TYPE_HALF_MONTHLY]: t('半月结'),
}

export const orderStateMap = {
  [Order_State.STATE_WAITING_SORT]:
    map_Order_State[Order_State.STATE_WAITING_SORT],
  [Order_State.STATE_SORTING]: map_Order_State[Order_State.STATE_SORTING],
  [Order_State.STATE_DELIVERYING]:
    map_Order_State[Order_State.STATE_DELIVERYING],
  [Order_State.STATE_RECEIVABLE]: map_Order_State[Order_State.STATE_RECEIVABLE],
}

export const orderPayStateMap = {
  [Order_PayState.PAYSTATE_NOTPAY]:
    map_Order_PayState[Order_PayState.PAYSTATE_NOTPAY],
  // [Order_PayState.PAYSTATE_PARTPAY]:
  //   map_Order_PayState[Order_PayState.PAYSTATE_PARTPAY],
  [Order_PayState.PAYSTATE_PAID]:
    map_Order_PayState[Order_PayState.PAYSTATE_PAID],
  // [Order_PayState.PAYSTATE_REFUND]:
  //   map_Order_PayState[Order_PayState.PAYSTATE_REFUND],
  // [Order_PayState.PAYSTATE_CLOSED]:
  //   map_Order_PayState[Order_PayState.PAYSTATE_CLOSED],
}

export const sortStatusMap = {
  [SortingStatus.SORTINGSTATUS_UNWEIGHT]:
    map_SortingStatus[SortingStatus.SORTINGSTATUS_UNWEIGHT],
  [SortingStatus.SORTINGSTATUS_WEIGHTED]:
    map_SortingStatus[SortingStatus.SORTINGSTATUS_WEIGHTED],
  [SortingStatus.SORTINGSTATUS_OUTOFSTOCK]:
    map_SortingStatus[SortingStatus.SORTINGSTATUS_OUTOFSTOCK],
}

export const appTypeMap = {
  [`${App_Type.TYPE_STATION}_${Order_OrderOp.ORDER_NORMAL}`]: t('系统录单'),
  [`${App_Type.TYPE_STATION}_${Order_OrderOp.ORDER_AMEND}`]: t('补录订单'),
  [`${App_Type.TYPE_BSHOP}_${Order_OrderOp.ORDER_NORMAL}`]: t('商城下单'),
  [`${App_Type.TYPE_BSHOP}_${Order_OrderOp.ORDER_AMEND}`]: t('商城下单'),
}

export const appType = [
  {
    value: `${App_Type.TYPE_STATION}_${Order_OrderOp.ORDER_NORMAL}`,
    text: t('系统录单'),
  },
  {
    value: `${App_Type.TYPE_STATION}_${Order_OrderOp.ORDER_AMEND}`,
    text: t('补录订单'),
  },
  { value: `${App_Type.TYPE_BSHOP}`, text: t('商城下单') },
]

export const deliveryType = [
  { value: 1, text: t('按默认设置生成交期') },
  { value: 2, text: t('自定义设置交期') },
]

export const orderSearchType = [
  {
    value: 1,
    text: t('按订单号'),
    key: 'serial_no',
    desc: t('输入订单号搜索'),
  },
  {
    value: 2,
    text: t('按商户'),
    key: 'receive_customer_id',
    desc: t('输入商户编码或商户名'),
  },
]

export const skuSearchType = [
  {
    value: 3,
    text: t('按商品'),
    key: 'ssu_q',
    desc: t('输入商品名或编码搜索'),
  },
]
export const sortTypes = parseSelectData(sortStatusMap)
export const orderState = parseSelectData(orderStateMap)
export const orderStateBusiness = _.filter(
  parseSelectData(orderStateMap),
  (v) =>
    v.value > Order_State.STATE_UNSPECIFIED &&
    v.value < Order_State.STATE_DELETE,
)

export const orderPayState = parseSelectData(orderPayStateMap)

export const studentListSearchType = [
  { value: 1, text: t('按订单号'), key: 'order_no', desc: t('输入订单号搜索') },
  {
    value: 2,
    text: t('按学生姓名'),
    key: 'student_name',
    desc: t('输入学生姓名搜索'),
  },
  {
    value: 3,
    text: t('按家长姓名'),
    key: 'parents_name',
    desc: t('输入家长姓名搜索'),
  },
]

export const staffListSearchType = [
  { value: 1, text: t('按订单号'), key: 'order_no', desc: t('输入订单号搜索') },
  {
    value: 2,
    text: t('按职工姓名'),
    key: 'teaching_staff_name',
    desc: t('输入职工姓名搜索'),
  },
]

export const groupMealStates = [
  { value: 0, text: t('全部状态') },
  { value: Order_State.STATE_NOT_PRODUCE, text: t('已下单') },
  { value: Order_State.STATE_DELETE, text: t('已删除') },
]
// 回单状态
export const receiptStatusMap: ObjectOfKey<string> = {
  1: t('已回单'),
  2: t('未回单'),
}
export const receiptStatus = parseSelectData(receiptStatusMap)
