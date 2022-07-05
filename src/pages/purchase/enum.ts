import { t } from 'gm-i18n'
import {
  TimeType,
  PurchaseTask_Status,
  PurchaseSheet_Status,
  map_PurchaseTask_Status,
  PurchaseTask_RequestSource,
  SplitPurchaseTaskRequest_SplitType,
} from 'gm_api/src/purchase'
import { Order_OrderOp, Order_State } from 'gm_api/src/order'
import { App_Type } from 'gm_api/src/common'
import { Sku_SupplierCooperateModelType } from 'gm_api/src/merchandise'
export const RadioType = {
  bill: SplitPurchaseTaskRequest_SplitType.SHEETS,
  amount: SplitPurchaseTaskRequest_SplitType.QUANTITY,
}

export const taskOptions = [
  {
    type: TimeType.CREATE_TIME,
    name: t('按创建时间'),
    expand: false,
  },
  {
    type: TimeType.PURCHASE_TIME,
    name: t('按计划交期'),
    expand: false,
  },
  {
    type: TimeType.RELEASE_TIME,
    name: t('按下达时间'),
    expand: false,
  },
]

export const planStates = [
  {
    value: PurchaseTask_Status.PREPARE,
    text: map_PurchaseTask_Status[PurchaseTask_Status.PREPARE],
  },
  {
    value: PurchaseTask_Status.RELEASED,
    text: map_PurchaseTask_Status[PurchaseTask_Status.RELEASED],
  },
  // {
  //   value: PurchaseTask_Status.FINISHED,
  //   text: map_PurchaseTask_Status[PurchaseTask_Status.FINISHED],
  // },
]

export const purchaseSheetState = [
  { value: PurchaseSheet_Status.UNSPECIFIED, text: t('全部状态') },
  { value: PurchaseSheet_Status.COMMIT, text: t('已完成') },
  { value: PurchaseSheet_Status.DRAFT, text: t('未完成') },
]

export enum SourceEnum {
  /** 全部来源 */
  ALL_SOURCE,
  /** 手工新建 */
  HANDLE_ADD,
  /** 采购计划 */
  PURCHASE_PLAN,
  /** 采购小程序 */
  PURCHASE_MINI_PROGRAM,
}

export const purchaseSheetReceiptSource = [
  { value: SourceEnum.ALL_SOURCE, text: t('全部来源') },
  { value: SourceEnum.PURCHASE_MINI_PROGRAM, text: t('采购小程序') },
  { value: SourceEnum.PURCHASE_PLAN, text: t('采购计划') },
  { value: SourceEnum.HANDLE_ADD, text: t('手工新建') },
]

/**
 * @description 这个主要filter中的单据来源使用
 */
/** App_Type 传参用，不同的source传不同的type   */
export const APP_TYPE_ENUM = {
  [SourceEnum.ALL_SOURCE]: App_Type.TYPE_UNSPECIFIED,
  [SourceEnum.HANDLE_ADD]: App_Type.TYPE_UNSPECIFIED,
  [SourceEnum.PURCHASE_PLAN]: App_Type.TYPE_UNSPECIFIED,
  [SourceEnum.PURCHASE_MINI_PROGRAM]: App_Type.TYPE_PURCHASE,
}
/**
 * @description ORDER_OP_ENUM和ORDER_STATE_ENUM 都是导出的时候使用
 */
/** order_op 传参用，不同的source传不同的type 导出的时候使用  */
export const ORDER_OP_ENUM = {
  [SourceEnum.ALL_SOURCE]: Order_OrderOp.ORDEROP_UNSPECIFIED,
  [SourceEnum.HANDLE_ADD]: Order_OrderOp.ORDER_PURCHASE_MANUAL,
  [SourceEnum.PURCHASE_PLAN]: Order_OrderOp.ORDER_PURCHASE_TASK,
  [SourceEnum.PURCHASE_MINI_PROGRAM]: Order_OrderOp.ORDER_PURCHASE_MANUAL,
}
/**  导出的时候使用 state 导出传参数用，不同的 status 对应不同的 state */
export const ORDER_STATE_ENUM = {
  [PurchaseSheet_Status.UNSPECIFIED]: Order_State.STATE_UNSPECIFIED,
  [PurchaseSheet_Status.COMMIT]: Order_State.STATE_COMMITTED,
  [PurchaseSheet_Status.DRAFT]: Order_State.STATE_DRAFT,
}

/** @description 单据来源类型 */
export const REQUEST_SOURCE = {
  [PurchaseTask_RequestSource.UNSPECIFIED]: t('未知来源'),
  [PurchaseTask_RequestSource.ORDER]: t('订单'),
  [PurchaseTask_RequestSource.PROCESS]: t('生产计划'),
  [PurchaseTask_RequestSource.STOCK]: t('库存'),
  [PurchaseTask_RequestSource.MANUAL]: t('手工新建'),
  [PurchaseTask_RequestSource.DIFF]: t('差异采购'),
  [PurchaseTask_RequestSource.PACK]: t('包装计划'),
  [PurchaseTask_RequestSource.PURCHASE_TASK]: t('拆分采购计划(按数量)'),
}

// 加一个供应商协作模式的TODO
/** @description 供应商协作模式 */
export const SUPPLIER_MODE = {
  [Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS]: t('仅供货'),
  [Sku_SupplierCooperateModelType.SCMT_WITH_SORTING]: t('代分拣'),
  [Sku_SupplierCooperateModelType.SCMT_WITH_DELIVERY]: t('代配送'),
}

export const selectMode = [
  {
    value: Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS,
    label: t('仅供货'),
  },
  {
    value: Sku_SupplierCooperateModelType.SCMT_WITH_SORTING,
    label: t('代分拣'),
  },
  {
    value: Sku_SupplierCooperateModelType.SCMT_WITH_DELIVERY,
    label: t('代配送'),
  },
]

// TODO: 计划采购数默认等于需求数
// TODO: 按数量拆分就是俺计划采购数拆分

// requestDetail的sheetValue 有一个为0
// 就让他的需求数为0 一条合成一条也是按照这样来判断

// 供应商协作模式。只从订单过来的就可以修改 其他都是不能修改的
// 计划采购数不等于需求数 只能是仅供货 不可以修改

// 如果是仅供货就可以选择按单和按数量
// 如果是待分拣或者待配送 只能选择按单据分配

// 按照商户拆
// 几个供应商 逻辑在后台

// 按数量拆分（什么时候不能） 待分拣/待配送 不能按照数量拆分

// 按数量拆分  如果没有采购明细就不能按单据拆分
