export interface SettlementStatus<T> {
  TO_BE_SUBMITTED: T // 待提交
  FAILED_TO_PASS: T // 审核不通过
  TO_BE_SETTLEMENT: T // 已提交待结款
  PARTIAL_SETTLEMENT: T // 部分结款
  SETTLED_ACCOUNT: T // 已结款
  DELETE: T // 删除
}

export interface SettlementStatusAll<T> extends SettlementStatus<T> {
  ALL: T // 全部
}

export type SettlementStatusKey = keyof SettlementStatusAll<string>

export interface ReceiptStatus<T> {
  toBeSubmitted: T // 待提交a
  cancelApproval: T // 被反审，审核不通过
  notApproved: T // 被驳回
  submitted: T // 已提交，待入库（审核）
  approved: T // 审核通过（如：已入库）
  deleted: T // 已删除
  // transfer?: T
  split: T // 分批入库
}

export interface ReceiptStatusAll<T> extends ReceiptStatus<T> {
  all: T
}
