import {
  StockSheet_SheetType,
  StockSheet_SheetStatus,
  OperateType,
  PendingType,
  WarehouseTransferSheet_TransferStatus,
} from 'gm_api/src/inventory'
import { Task_Type } from 'gm_api/src/asynctask/types'
import {
  AdjustSheet_AdjustSheetStatus,
  Batch_BatchType,
  CostAllocation_MoneyType,
  CostAllocation_Reason,
  CostAllocation_Type,
  ExpireType,
  StockSheet_PayStatus,
} from 'gm_api/src/inventory/types'
import { t } from 'gm-i18n'

import {
  ReceiptType,
  BatchType,
  LogType,
  ReceiptStatusAll,
  ObjectOfKey,
  AdjustStatus,
  ReceiptActionType,
  ReceiptStatusKey,
  ExportType,
} from './interface'

// 单据类型
export const RECEIPT_TYPE: ReceiptType = {
  // 入库
  purchaseIn: StockSheet_SheetType.SHEET_TYPE_PURCHASE_IN, // 采购入库
  productIn: StockSheet_SheetType.SHEET_TYPE_PRODUCT_IN, // 生产入库
  materialIn: StockSheet_SheetType.SHEET_TYPE_MATERIAL_IN, // 退料入库
  saleRefundIn: StockSheet_SheetType.SHEET_TYPE_REFUND_IN, // 销售退货入库
  otherIn: StockSheet_SheetType.SHEET_TYPE_OTHER_IN, // 其他入库RECEIPT_TYPE
  // 出库
  saleOut: StockSheet_SheetType.SHEET_TYPE_SALE_OUT, // 销售出库
  materialOut: StockSheet_SheetType.SHEET_TYPE_MATERIAL_OUT, // 领料出库
  purchaseRefundOut: StockSheet_SheetType.SHEET_TYPE_REFUND_OUT, // 采购退货出库
  otherOut: StockSheet_SheetType.SHEET_TYPE_OTHER_OUT, // 其他出库
  warehouseOut: StockSheet_SheetType.SHEET_TYPE_WAREHOUSE_OUT, // 调拨出库
  // 盘点
  inventory: StockSheet_SheetType.SHEET_TYPE_INVENTORY, // 盘点单
  transfer: StockSheet_SheetType.SHEET_TYPE_TRANSFER,
  // 周转物类型
  turnoverLoan: StockSheet_SheetType.SHEET_TYPE_TURNOVER_LOAN, // 借出单（记录）
  turnoverRevert: StockSheet_SheetType.SHEET_TYPE_TURNOVER_REVERT, // 归还单（记录）
  // 移库单
  // transfer: StockSheet_SheetType.SHEET_TYPE_TRANSFER,
  unspecified: StockSheet_SheetType.SHEET_TYPE_UNSPECIFIED,
  // 调拨单
  transferIn: StockSheet_SheetType.SHEET_TYPE_WAREHOUSE_IN,
  transferOut: StockSheet_SheetType.SHEET_TYPE_WAREHOUSE_OUT,
}

// 导出类型
export const EXPORT_TASK_TYPE: ExportType = {
  stockSheetList: Task_Type.TYPE_INVENTORY_STOCK_SHEET_LIST_EXPORT, // 库存单据导出
  batch: Task_Type.TYPE_INVENTORY_BATCH_LOG_EXPORT, // 批次流水导出
  change: Task_Type.TYPE_INVENTORY_CHANGE_LOG_EXPORT, // 商品台账导出
  purchaseIn: Task_Type.TYPE_INVENTORY_PURCHASE_IN_LOG_EXPORT, // 采购入库明细导出
  saleOut: Task_Type.TYPE_INVENTORY_SALE_OUT_LOG_EXPORT, // 销售出库明细导出
  materialOut: Task_Type.TYPE_INVENTORY_MATERIAL_OUT_LOG_EXPORT, // 领料出库明细导出
  materialIn: Task_Type.TYPE_INVENTORY_MATERIAL_IN_LOG_EXPORT, // 退料入库明细导出
  productIn: Task_Type.TYPE_INVENTORY_PRODUCT_IN_LOG_EXPORT, // 生产入库明细导出
  refoundIn: Task_Type.TYPE_INVENTORY_REFOUND_OUT_LOG_EXPORT, // 采购退货出库明细导出
  otherOut: Task_Type.TYPE_INVENTORY_OTHER_OUT_LOG_EXPORT, // 其他出库明细导出
  otherIn: Task_Type.TYPE_INVENTORY_OTHER_IN_LOG_EXPORT, // 其他入库明细导出
  increaseIn: Task_Type.TYPE_INVENTORY_INCREASE_IN_LOG_EXPORT, // 盘盈入库明细导出
  lossOut: Task_Type.TYPE_INVENTORY_LOSS_OUT_LOG_EXPORT, // 盘亏出库明细导出
  skuStock: Task_Type.TYPE_INVENTORY_SKU_STOCK_EXPORT, // 库存总览导出
  turnoverLog: Task_Type.TYPE_INVENTORY_CUSTOMER_TURNOVER_LOG_EXPORT, // 客户周转物借出归还记录
  saleRefundIn: Task_Type.TYPE_INVENTORY_REFOUND_IN_LOG_EXPORT, // 销售退货入库
  transferIn: Task_Type.TYPE_INVENTORY_TRANSFER_IN_LOG_EXPORT, // 调拨入库纪录导出
  transferOut: Task_Type.TYPE_INVENTORY_TRANSFER_OUT_LOG_EXPORT, // 调拨出库纪录导出
}

// 单据类型名
export const RECEIPT_TYPE_NAME: { [key: number]: string } = {
  [RECEIPT_TYPE.purchaseIn]: t('采购入库'),
  [RECEIPT_TYPE.productIn]: t('生产入库'),
  [RECEIPT_TYPE.materialIn]: t('退料入库'),
  [RECEIPT_TYPE.saleRefundIn]: t('销售退货入库'),
  [RECEIPT_TYPE.otherIn]: t('其他入库'),

  [RECEIPT_TYPE.saleOut]: t('销售出库'),
  [RECEIPT_TYPE.materialOut]: t('领料出库'),
  [RECEIPT_TYPE.purchaseRefundOut]: t('采购退货出库'),
  [RECEIPT_TYPE.otherOut]: t('其他出库'),

  [RECEIPT_TYPE.inventory]: t('盘点单'),
  [RECEIPT_TYPE.turnoverLoan]: t('借出单'),
  [RECEIPT_TYPE.turnoverRevert]: t('归还单'),
  [RECEIPT_TYPE.transfer]: t('移库单'),

  [RECEIPT_TYPE.transferIn]: t('调拨入库'),
}

// log操作类型
export const OPERATE_TYPE: LogType = {
  // 入库
  purchaseIn: OperateType.OPERATE_TYPE_PURCHASE_IN, // 采购入库
  productIn: OperateType.OPERATE_TYPE_PRODUCT_IN, // 生产入库
  materialIn: OperateType.OPERATE_TYPE_MATERIAL_IN, // 退料入库
  refundIn: OperateType.OPERATE_TYPE_REFUND_IN, // 销售退货入库
  increase: OperateType.OPERATE_TYPE_INCREASE, // 盘盈入库
  otherIn: OperateType.OPERATE_TYPE_OTHER_IN, // 其他入库
  transferIn: OperateType.OPERATE_TYPE_TRANSFER_IN, // 调拨入库
  // 出库
  saleOut: OperateType.OPERATE_TYPE_SALE_OUT, // 销售出库
  materialOut: OperateType.OPERATE_TYPE_MATERIAL_OUT, // 领料出库
  refundOut: OperateType.OPERATE_TYPE_REFUND_OUT, // 采购退货出库
  loss: OperateType.OPERATE_TYPE_LOSS, // 盘亏出库
  otherOut: OperateType.OPERATE_TYPE_OTHER_OUT, // 其他出库
  transferOut: OperateType.OPERATE_TYPE_TRANSFER_OUT, // 调拨出库
  // 反审入库
  purchaseInRollBack: OperateType.OPERATE_TYPE_PURCHASE_IN_ROLL_BACK, // 采购入库反审核
  productInRollBack: OperateType.OPERATE_TYPE_PRODUCT_IN_ROLL_BACK, // 加工入库反审核
  materialInRollBack: OperateType.OPERATE_TYPE_MATERIAL_IN_ROLL_BACK, // 退料入库反审核
  otherInRollBack: OperateType.OPERATE_TYPE_OTHER_IN_ROLL_BACK, // 其他入库反审核
  // 反审出库
  saleOutRollBack: OperateType.OPERATE_TYPE_SALE_OUT_ROLL_BACK, // 销售出库反审核
  materialOutRollBack: OperateType.OPERATE_TYPE_MATERIAL_OUT_ROLL_BACK, // 领料出库反审核
  refundOutRollBack: OperateType.OPERATE_TYPE_REFUND_OUT_ROLL_BACK, // 采购退货反审核
  otherOutRollBack: OperateType.OPERATE_TYPE_OTHER_OUT_ROLL_BACK, // 其他出库反审核
  // 周转物
  turnoverLoan: OperateType.OPERATE_TYPE_TURNOVER_LOAN, // 周转物借出
  turnoverRevert: OperateType.OPERATE_TYPE_TURNOVER_REVERT, // 周转物归还
  // 超支库存
  virtualIn: OperateType.OPERATE_TYPE_VIRTUAL_IN, // 超支库存
  virtualInRollBack: OperateType.OPERATE_TYPE_VIRTUAL_IN_ROLL_BACK, // 超支库存反审核
  // 调拨
  allocateIn: OperateType.OPERATE_TYPE_WAREHOUSE_IN, // 超支库存
  allocateOut: OperateType.OPERATE_TYPE_WAREHOUSE_OUT, // 超支库存反审核
}

// log操作类型名
export const OPERATE_TYPE_NAME: { [key: number]: string } = {
  [OPERATE_TYPE.purchaseIn]: t('采购入库'),
  [OPERATE_TYPE.productIn]: t('生产入库'),
  [OPERATE_TYPE.materialIn]: t('退料入库'),
  [OPERATE_TYPE.refundIn]: t('销售退货入库'),
  [OPERATE_TYPE.increase]: t('盘盈入库'),
  [OPERATE_TYPE.otherIn]: t('其他入库'),

  [OPERATE_TYPE.saleOut]: t('销售出库'),
  [OPERATE_TYPE.materialOut]: t('领料出库'),
  [OPERATE_TYPE.refundOut]: t('采购退货出库'),
  [OPERATE_TYPE.loss]: t('盘亏出库'),
  [OPERATE_TYPE.otherOut]: t('其他出库'),

  [OPERATE_TYPE.purchaseInRollBack]: t('采购入库反审核'),
  [OPERATE_TYPE.productInRollBack]: t('加工入库反审核'),
  [OPERATE_TYPE.materialInRollBack]: t('退料入库反审核'),
  [OPERATE_TYPE.otherInRollBack]: t('其他入库反审核'),

  [OPERATE_TYPE.saleOutRollBack]: t('销售出库反审核'),
  [OPERATE_TYPE.materialOutRollBack]: t('领料出库反审核'),
  [OPERATE_TYPE.refundOutRollBack]: t('采购退货反审核'),
  [OPERATE_TYPE.otherOutRollBack]: t('其他出库反审核'),

  [OPERATE_TYPE.turnoverLoan]: t('周转物借出'),
  [OPERATE_TYPE.turnoverRevert]: t('周转物归还'),

  [OPERATE_TYPE.virtualIn]: t('创建超支库存'),
  [OPERATE_TYPE.virtualInRollBack]: t('超支库存反审核'),
  [OPERATE_TYPE.transferIn]: t('移库入库'),
  [OPERATE_TYPE.transferOut]: t('移库出库'),
  [OPERATE_TYPE.allocateIn]: t('调拨入库'),
  [OPERATE_TYPE.allocateOut]: t('调拨出库'),
}

// 调整单类型
export const ADJUST_STATUS: AdjustStatus<number> = {
  all: AdjustSheet_AdjustSheetStatus.ADJUST_SHEET_STATUS_UNSPECIFIED,
  notSubmit: AdjustSheet_AdjustSheetStatus.ADJUST_SHEET_STATUS_NOT_SUBMITTED,
  adjusting: AdjustSheet_AdjustSheetStatus.ADJUST_SHEET_STATUS_ADJUSTING,
  done: AdjustSheet_AdjustSheetStatus.ADJUST_SHEET_STATUS_DONE,
}

// 批次单类型
export const BATCH_STATUS: BatchType<number> = {
  all: Batch_BatchType.BATCH_TYPE_UNSPECIFIED,
  const: Batch_BatchType.BATCH_TYPE_CONST,
  vir: Batch_BatchType.BATCH_TYPE_TMP,
}

// 库存类型
export const PENDING_TYPE: { [key: string]: number } = {
  purchaseIn: PendingType.PENDING_TYPE_PURCHASE_IN,
  productIn: PendingType.PENDING_TYPE_PRODUCT_IN,
  materialOut: PendingType.PENDING_TYPE_MATERIAL_OUT,
  saleOut: PendingType.PENDING_TYPE_ORDER,
}

// 库存类型名
export const PENDING_TYPE_NAME: ObjectOfKey<string> = {
  [PendingType.PENDING_TYPE_PURCHASE_IN]: t('采购入库'),
  [PendingType.PENDING_TYPE_PRODUCT_IN]: t('生产入库'),
  [PendingType.PENDING_TYPE_MATERIAL_OUT]: t('生产领料'),
  [PendingType.PENDING_TYPE_ORDER]: t('销售出库'),
}

// 预期库存类型
export const EXPECT_TYPE_NAME: ObjectOfKey<string> = {
  [PendingType.PENDING_TYPE_PURCHASE_IN]: t('在途库存'),
  [PendingType.PENDING_TYPE_PRODUCT_IN]: t('在途库存'),
  [PendingType.PENDING_TYPE_MATERIAL_OUT]: t('冻结库存'),
  [PendingType.PENDING_TYPE_ORDER]: t('冻结库存'),
}

// 单据状态值
export const RECEIPT_STATUS: ReceiptStatusAll<number> = {
  all: 0, // 全部
  toBeSubmitted: StockSheet_SheetStatus.SHEET_STATUS_NOT_SUBMITTED, // 待提交
  notApproved: StockSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED, // 被驳回，审核不通过
  cancelApproval: StockSheet_SheetStatus.SHEET_STATUS_CANCEL_APPROVAL, // 被反审,已经提交
  submitted: StockSheet_SheetStatus.SHEET_STATUS_SUBMITTED, // 已提交，待入库/出库（审核）
  approved: StockSheet_SheetStatus.SHEET_STATUS_APPROVED, // 审核通过（如：已入库/出库）
  deleted: StockSheet_SheetStatus.SHEET_STATUS_DELETED, // 已删除
  transfer: StockSheet_SheetStatus.SHEET_STATUS_APPROVED, // 已调拨
}

// 单据状态key_name
export const RECEIPT_STATUS_KEY_NAME: {
  [key: number]: ReceiptStatusKey
} = {
  [RECEIPT_STATUS.toBeSubmitted]: 'toBeSubmitted',
  [RECEIPT_STATUS.notApproved]: 'notApproved',
  [RECEIPT_STATUS.cancelApproval]: 'cancelApproval',
  [RECEIPT_STATUS.submitted]: 'submitted',
  [RECEIPT_STATUS.approved]: 'approved',
  [RECEIPT_STATUS.deleted]: 'deleted',
}

// 入库单据状态名
export const STOCK_IN_RECEIPT_STATUS_NAME: ObjectOfKey<string> = {
  [RECEIPT_STATUS.all]: t('全部'),
  [RECEIPT_STATUS.toBeSubmitted]: t('待提交'),
  [RECEIPT_STATUS.notApproved]: t('被驳回'),
  [RECEIPT_STATUS.cancelApproval]: t('被反审'),
  [RECEIPT_STATUS.submitted]: t('已提交待入库'),
  [RECEIPT_STATUS.approved]: t('已入库'),
  [RECEIPT_STATUS.deleted]: t('已删除'),
}

// 出库单据状态名
export const STOCK_OUT_RECEIPT_STATUS_NAME: ObjectOfKey<string> = {
  [RECEIPT_STATUS.all]: t('全部'),
  [RECEIPT_STATUS.toBeSubmitted]: t('待提交'),
  [RECEIPT_STATUS.notApproved]: t('被驳回'),
  [RECEIPT_STATUS.cancelApproval]: t('被反审'),
  [RECEIPT_STATUS.submitted]: t('已提交待出库'),
  [RECEIPT_STATUS.approved]: t('已出库'),
  [RECEIPT_STATUS.deleted]: t('已删除'),
}

// 出库单据状态名
export const CANNIBALIZE_STATUS_NAME: ObjectOfKey<string> = {
  [RECEIPT_STATUS.all]: t('全部'),
  [RECEIPT_STATUS.toBeSubmitted]: t('待提交'),
  [RECEIPT_STATUS.notApproved]: t('被驳回'),
  // [RECEIPT_STATUS.cancelApproval]: t('被反审'),
  [RECEIPT_STATUS.submitted]: t('已提交待调拨'),
  [RECEIPT_STATUS.approved]: t('已调拨'),
  [RECEIPT_STATUS.deleted]: t('已删除'),
}

// 调拨单据状态名
export const TREANSFER_STATUS_NAME: ObjectOfKey<string> = {
  [RECEIPT_STATUS.all]: t('全部'),
  [RECEIPT_STATUS.toBeSubmitted]: t('待提交'),
  [RECEIPT_STATUS.notApproved]: t('被驳回'),
  // [RECEIPT_STATUS.cancelApproval]: t('被反审'),
  [RECEIPT_STATUS.submitted]: t('已提交待审核'),
  [RECEIPT_STATUS.approved]: t('已审核'),
  [RECEIPT_STATUS.deleted]: t('已删除'),
}

// 盘点单据状态名
export const STOCK_MANAGE_RECEIPT_STATUS_NAME: ObjectOfKey<string> = {
  [RECEIPT_STATUS.all]: t('全部'),
  [RECEIPT_STATUS.toBeSubmitted]: t('待提交'),
  [RECEIPT_STATUS.notApproved]: t('被驳回'),
  [RECEIPT_STATUS.cancelApproval]: t('被反审'),
  [RECEIPT_STATUS.submitted]: t('已提交待审核'),
  [RECEIPT_STATUS.approved]: t('已审核'),
  [RECEIPT_STATUS.deleted]: t('已删除'),
}

// 调拨单据状态名
export const STOCK_TRANSFER_RECEIPT_STATUS_NAME: ObjectOfKey<string> = {
  [RECEIPT_STATUS.all]: t('全部'),
  [RECEIPT_STATUS.toBeSubmitted]: t('待提交'),
  [RECEIPT_STATUS.notApproved]: t('被驳回'),
  [RECEIPT_STATUS.cancelApproval]: t('被反审'),
  [RECEIPT_STATUS.submitted]: t('已提交待移库'),
  [RECEIPT_STATUS.approved]: t('已移库'),
  [RECEIPT_STATUS.deleted]: t('已删除'),
}

// 周转物借出单据状态名
export const TURN_OVER_LEND_STATUS_NAME: ObjectOfKey<string> = {
  [RECEIPT_STATUS.all]: t('全部'),
  [RECEIPT_STATUS.toBeSubmitted]: t('待借出'),
  [RECEIPT_STATUS.submitted]: t('已借出'),
  [RECEIPT_STATUS.deleted]: t('已删除'),
}

// 周转物归还状态名
export const TURN_OVER_RETURN_STATUS_NAME: ObjectOfKey<string> = {
  [RECEIPT_STATUS.all]: t('全部'),
  [RECEIPT_STATUS.toBeSubmitted]: t('待归还'),
  [RECEIPT_STATUS.submitted]: t('已归还'),
  [RECEIPT_STATUS.deleted]: t('已删除'),
}

// 调整单状态值
export const ADJUST_TABS_NAME: ObjectOfKey<string> = {
  [ADJUST_STATUS.all]: t('全部'),
  [ADJUST_STATUS.notSubmit]: t('未提交'),
  [ADJUST_STATUS.adjusting]: t('调整中'),
  [ADJUST_STATUS.done]: t('调整完成'),
}
/** 轻巧版隐藏这些tab，包括入库和出库 */
export const HIDE_STOCK_IN_OR_OUT_RECEIPT_TABS_WITH_LITE = [
  'notApproved',
  'cancelApproval',
  'submitted',
  'deleted',
]
// 入库类列表页状态tab
export const STOCK_IN_RECEIPT_TABS: ReceiptStatusAll<string> = {
  all: t('全部'), // 全部
  toBeSubmitted: t('待提交'),
  notApproved: t('被驳回'), // 被驳回，审核不通过
  cancelApproval: t('被反审'), // 被反审,已经提交
  submitted: t('已提交待入库'), // 已提交，待入库（审核）
  approved: t('已入库'), // 审核通过（如：已入库）
  deleted: t('已删除'), // 已删除
}

// 出库类列表页状态tab
export const STOCK_OUT_RECEIPT_TABS: ReceiptStatusAll<string> = {
  all: t('全部'), // 全部
  toBeSubmitted: t('待提交'),
  notApproved: t('被驳回'), // 被驳回，审核不通过
  cancelApproval: t('被反审'), // 被反审,已经提交
  submitted: t('已提交待出库'), // 已提交，待入库（审核）
  approved: t('已出库'), // 审核通过（如：已入库）
  deleted: t('已删除'), // 已删除
}

// 货值调整单页状态tab
export const ADJUST_TABS: Omit<AdjustStatus<string>, 'notSubmit'> = {
  all: t('全部'),
  adjusting: t('调整中'),
  done: t('调整完成'),
}
// 盘点状态tab
export const MANAGE_TABS: ReceiptStatusAll<string> = {
  all: t('全部'), // 全部
  toBeSubmitted: t('待提交'),
  notApproved: t('被驳回'), // 被驳回，审核不通过
  cancelApproval: t('被反审'), // 被反审,已经提交
  submitted: t('已提交待审核'), // 已提交，待入库（审核）
  approved: t('已审核'), // 审核通过（如：已入库）
  deleted: t('已删除'), // 已删除
}

// 调拨状态tab
export const TRANSFER_TABS: ReceiptStatusAll<string> = {
  all: t('全部'), // 全部
  toBeSubmitted: t('待提交'),
  notApproved: t('被驳回'), // 被驳回，审核不通过
  cancelApproval: t('被反审'), // 被反审,已经提交
  submitted: t('已提交待移库'), // 已提交，待入库（审核）
  approved: t('已移库'), // 审核通过（如：已入库）
  deleted: t('已删除'), // 已删除
}

// 调拨出入库类列表页状态tab
export const AllOCATE_STOCK_IN_RECEIPT_TABS: Omit<
  ReceiptStatusAll<string>,
  'split' | 'deleted' | 'cancelApproval'
> = {
  all: t('全部'), // 全部
  toBeSubmitted: t('待提交'),
  notApproved: t('被驳回'), // 被驳回，审核不通过
  // cancelApproval: t('被反审'), // 被反审,已经提交
  submitted: t('已提交待入库'), // 已提交，待入库（审核）
  approved: t('已入库'), // 审核通过（如：已入库）
  // deleted: t('已删除'), // 已删除
}

// 调拨单据状态名
export const AllOCATE_STOCK_IN_RECEIPT_TABS_NAME: ObjectOfKey<string> = {
  [RECEIPT_STATUS.all]: t('全部'),
  [RECEIPT_STATUS.toBeSubmitted]: t('待提交'),
  [RECEIPT_STATUS.notApproved]: t('被驳回'),
  // [RECEIPT_STATUS.cancelApproval]: t('被反审'),
  [RECEIPT_STATUS.submitted]: t('已提交待入库'),
  [RECEIPT_STATUS.approved]: t('已入库'),
  // [RECEIPT_STATUS.deleted]: t('已删除'),
}

// 调拨单据状态名
export const AllOCATE_STOCK_OUT_RECEIPT_TABS_NAME: ObjectOfKey<string> = {
  [RECEIPT_STATUS.all]: t('全部'),
  [RECEIPT_STATUS.toBeSubmitted]: t('待提交'),
  [RECEIPT_STATUS.notApproved]: t('被驳回'),
  // [RECEIPT_STATUS.cancelApproval]: t('被反审'),
  [RECEIPT_STATUS.submitted]: t('已提交待出库'),
  [RECEIPT_STATUS.approved]: t('已出库'),
  // [RECEIPT_STATUS.deleted]: t('已删除'),
}
// 状态标识
export const RECEIPT_STATUS_TAG: {
  [key: number]: 'processing' | 'finish' | 'error'
} = {
  [RECEIPT_STATUS.toBeSubmitted]: 'processing',
  [RECEIPT_STATUS.notApproved]: 'processing',
  [RECEIPT_STATUS.submitted]: 'processing',
  [RECEIPT_STATUS.approved]: 'finish',
  [RECEIPT_STATUS.cancelApproval]: 'error',
  [RECEIPT_STATUS.deleted]: 'error',
}

// 状态下可以操作的行为
export const RECEIPT_ACTIONABLE_LIST: {
  [key: number]: (keyof ReceiptActionType)[]
} = {
  [-1]: ['submitted', 'toBeSubmitted'], // 未有单据内容
  [RECEIPT_STATUS.toBeSubmitted]: [
    'toBeSubmitted',
    'submitted',
    'print',
    'export',
    'deleted',
  ], // 待提交
  [RECEIPT_STATUS.submitted]: ['approved', 'notApproved', 'print', 'export'], // 已提交待审核
  [RECEIPT_STATUS.approved]: ['cancelApproval', 'print', 'export'], // 已审核入库
  [RECEIPT_STATUS.deleted]: ['print', 'export'], // 已删除
  [RECEIPT_STATUS.notApproved]: [
    'submitted',
    'toBeSubmitted',
    'deleted',
    'print',
    'export',
  ], // 被驳回
  [RECEIPT_STATUS.cancelApproval]: [
    'submitted',
    'toBeSubmitted',
    'deleted',
    'print',
    'export',
  ], // 被反审
}

export const RECEIPT_ACTION_TYPE_NAME: Omit<
  ReceiptActionType,
  'print' | 'export'
> = {
  submitted: t('提交单据'),
  approved: t('审核单据'),
  deleted: t('删除单据'),
  cancelApproval: t('反审单据'),
  notApproved: t('驳回单据'),
  toBeSubmitted: t('保存草稿'),
  split: t('分批提交'),
}

// 分摊原因
export const PRODUCT_REASON_TYPE = [
  { value: CostAllocation_Reason.REASON_TRANSPORT, text: t('运输费用分摊') },
  { value: CostAllocation_Reason.REASON_OTHER, text: t('其他费用分摊') },
]
// 分摊方式
export const PRODUCT_ACTION_TYPE = [
  { value: CostAllocation_MoneyType.MONEY_ADD, text: t('加钱') },
  { value: CostAllocation_MoneyType.MONEY_SUB, text: t('扣钱') },
]
// 分摊类型
export const PRODUCT_METHOD_TYPE = [
  { value: CostAllocation_Type.TYPE_PRICE, text: t('金额分摊') },
  { value: CostAllocation_Type.TYPE_QUANTITY, text: t('入库数分摊') },
]

// 打印状态
export const STOCK_PRINT_STATUS = [
  { value: 0, text: t('全部状态') },
  { value: 1, text: t('未打印') },
  { value: 2, text: t('已打印') },
]

// 定位筛选
export const POSITION_FILTER_STATUS = [
  { value: '0', text: t('全部商品') },
  { value: '1', text: t('盘盈商品') },
  { value: '2', text: t('盘亏商品') },
]

// 周转物借出
export const TURNOVER_LEND_STATUS = [
  { value: RECEIPT_STATUS.toBeSubmitted, text: t('待借出') },
  { value: RECEIPT_STATUS.submitted, text: t('已借出') },
  { value: RECEIPT_STATUS.deleted, text: t('已删除') },
]

// 周转物归还
export const TURNOVER_RETURN_STATUS = [
  { value: RECEIPT_STATUS.toBeSubmitted, text: t('待归还') },
  { value: RECEIPT_STATUS.submitted, text: t('已归还') },
  { value: RECEIPT_STATUS.deleted, text: t('已删除') },
]

export const POSITION_FILTER = {
  all: '0',
  profit: '1',
  loss: '2',
}

// 商品分类
export const SKU_TYPE = [
  { value: 0, text: t('所有商品类型') },
  { value: 1, text: t('包材商品') },
  { value: 2, text: t('非包材商品') },
]

export const SKU_TYPE_NAME: { [key: number]: string } = {
  1: t('包材商品'),
  2: t('非包材商品'),
  3: t('所有商品类型'),
}

/** 商品保质期状态 */
export const SKU_HEALTH = [
  { value: ExpireType.EXPIRE_TYPE_UNSPECIFIED, text: t('全部商品') },
  { value: ExpireType.EXPIRE_TYPE_SAFE, text: t('正常商品') },
  { value: ExpireType.EXPIRE_TYPE_CLOSE, text: t('临期商品') },
  { value: ExpireType.EXPIRE_TYPE_EXPIRE, text: t('过期商品') },
]

export const OPERATE_TYPE_SELECT = [
  { value: 0, text: t('全部') },
  { value: OPERATE_TYPE.purchaseIn, text: t('采购入库') },
  { value: OPERATE_TYPE.productIn, text: t('生产入库') },
  { value: OPERATE_TYPE.materialIn, text: t('退料入库') },
  { value: OPERATE_TYPE.refundIn, text: t('销售退货入库') },
  { value: OPERATE_TYPE.increase, text: t('盘盈入库') },
  { value: OPERATE_TYPE.otherIn, text: t('其他入库') },
  { value: OPERATE_TYPE.saleOut, text: t('销售出库') },
  { value: OPERATE_TYPE.materialOut, text: t('领料出库') },
  { value: OPERATE_TYPE.refundOut, text: t('采购退货出库') },
  { value: OPERATE_TYPE.loss, text: t('盘亏出库') },
  { value: OPERATE_TYPE.otherOut, text: t('其他出库') },
  { value: OPERATE_TYPE.purchaseInRollBack, text: t('采购入库反审核') },
  { value: OPERATE_TYPE.productInRollBack, text: t('加工入库反审核') },
  { value: OPERATE_TYPE.materialInRollBack, text: t('退料入库反审核') },
  { value: OPERATE_TYPE.otherInRollBack, text: t('其他入库反审核') },
  { value: OPERATE_TYPE.saleOutRollBack, text: t('销售出库反审核') },
  { value: OPERATE_TYPE.materialOutRollBack, text: t('领料出库反审核') },
  { value: OPERATE_TYPE.refundOutRollBack, text: t('采购退货反审核') },
  { value: OPERATE_TYPE.otherOutRollBack, text: t('其他出库反审核') },
  { value: OPERATE_TYPE.turnoverLoan, text: t('周转物借出') },
  { value: OPERATE_TYPE.turnoverRevert, text: t('周转物归还') },
  { value: OPERATE_TYPE.virtualIn, text: t('创建超支库存') },
  { value: OPERATE_TYPE.virtualInRollBack, text: t('超支库存反审核') },
  { value: OPERATE_TYPE.transferIn, text: t('调拨入库') },
  { value: OPERATE_TYPE.transferOut, text: t('调拨出库') },
]

export const PAY_STATUS = [
  {
    value: StockSheet_PayStatus.PAY_STATUS_UNSPECIFIED,
    text: t('全部支付状态'),
  },
  { value: StockSheet_PayStatus.PAY_STATUS_NOT_PAID, text: t('未支付') }, // StockSheet_PayStatus.PAY_STATUS_NOT_PAID，StockSheet_PayStatus.PAY_STATUS_READY_TO_PAY都是未支付，只用一种来标示，选中后需要提交两种情况
  { value: StockSheet_PayStatus.PAY_STATUS_PAID, text: t('已支付') },
]

// 关联对象条件
export const MODULE_SELECT = {
  customer: 1,
  route: 2,
}

export const MODULE_STATUS = [
  { value: MODULE_SELECT.customer, text: t('关联客户') },
  { value: MODULE_SELECT.route, text: t('关联线路') },
]

export const USE_STATUS = [
  { value: 0, text: t('全部') },
  { value: 1, text: t('启用') },
  { value: 2, text: t('停用') },
]

export const COMMON_SELECT = [
  { value: 1, text: t('是') },
  { value: 0, text: t('否') },
]

// 打印状态
export const PRINTED_STATUS = [
  { value: 0, text: t('全部') },
  { value: 1, text: t('是') },
  { value: 2, text: t('否') },
]

// 调拨类型
export const TRANSFER_TYPE = [
  { value: 0, text: t('全部') },
  { value: 1, text: t('平价调拨') },
  { value: 2, text: t('异价调拨') },
]

// 调拨状态
export const TRANDSFER_STATUS = [
  {
    value: WarehouseTransferSheet_TransferStatus?.STATUS_WAITING_OUT,
    text: t('待出库'),
  },
  {
    value: WarehouseTransferSheet_TransferStatus?.STATUS_WAITING_IN,
    text: t('待入库'),
  },
  {
    value: WarehouseTransferSheet_TransferStatus?.STATUS_FINISH,
    text: t('调拨完成'),
  },
]
