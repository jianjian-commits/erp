import { t } from 'gm-i18n'
import { App_Type, Filters_Bool } from 'gm_api/src/common'
import _ from 'lodash'
import {
  Order_OrderOp,
  Order_State,
  SortingStatus,
  map_Order_State,
  map_SortingStatus,
} from 'gm_api/src/order'

export const appTypeMap = {
  [`${App_Type.TYPE_STATION}_${Order_OrderOp.ORDER_NORMAL}`]: t('系统录单'),
  [`${App_Type.TYPE_STATION}_${Order_OrderOp.ORDER_AMEND}`]: t('补录订单'),
  [`${App_Type.TYPE_BSHOP}_${Order_OrderOp.ORDER_NORMAL}`]: t('商城下单'),
  [`${App_Type.TYPE_BSHOP}_${Order_OrderOp.ORDER_AMEND}`]: t('商城下单'),
}

export const orderStateMap = {
  [Order_State.STATE_SORTING]: map_Order_State[Order_State.STATE_SORTING],
  [Order_State.STATE_DELIVERYING]:
    map_Order_State[Order_State.STATE_DELIVERYING],
  [Order_State.STATE_RECEIVABLE]: map_Order_State[Order_State.STATE_RECEIVABLE],
}

export const sortStatusMap = {
  [SortingStatus.SORTINGSTATUS_UNWEIGHT]:
    map_SortingStatus[SortingStatus.SORTINGSTATUS_UNWEIGHT],
  [SortingStatus.SORTINGSTATUS_WEIGHTED]:
    map_SortingStatus[SortingStatus.SORTINGSTATUS_WEIGHTED],
  [SortingStatus.SORTINGSTATUS_OUTOFSTOCK]:
    map_SortingStatus[SortingStatus.SORTINGSTATUS_OUTOFSTOCK],
}

function parseSelectData(m: { [key: number]: string }) {
  return _.map(m, (text, value) => {
    return {
      value: +value,
      text: text,
    }
  }).filter((v) => v.text)
}

// 默认订单类型: 搜索筛选默认全部，创建订单独自定义默认为常规
export const initOrderType = '0'

export const INSPECT_STATUS_SKU = [
  { value: '', text: t('全部状态') },
  { value: 1, text: t('未验货') },
  { value: 2, text: t('已验货') },
]

// 订单类型, 搜索条件
export const orderTypes = [
  { value: '0', text: t('全部') },
  { value: '', text: t('常规') },
]

// 订单状态
export const SORTING_STATUS_LIST = parseSelectData(orderStateMap)

// 分拣状态
export const SORT_STATUS_ORDER = parseSelectData(sortStatusMap)

export const ORDER_PRINT_STATUS = [
  { value: Filters_Bool.ALL, text: t('全部状态') },
  { value: Filters_Bool.TRUE, text: t('已打印') },
  { value: Filters_Bool.FALSE, text: t('未打印') },
]
