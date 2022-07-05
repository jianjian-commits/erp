export enum ReceiptStatusEnum {
  all = 'all',
  toBeSubmitted = 'toBeSubmitted', // 待提交a
  cancelApproval = 'cancelApproval', // 被反审，审核不通过
  notApproved = 'notApproved', // 被驳回
  submitted = 'submitted', // 已提交，待入库（审核）
  approved = 'approved', // 审核通过（如：已入库）
  deleted = 'deleted', // 已删除
  // transfer?: T
  split = 'split', // 分批入库
}

export enum TimeType {
  TIME_TYPE_UNSPECIFIED = 0,
  TIME_TYPE_CREATE_TIME = 1, // 建单时间
  TIME_TYPE_SUBMIT_TIME = 2, // 审核通过时间
}

// 单据状态
export enum SheetStatus {
  // 实体单据用,如入库单,出库单
  SHEET_STATUS_UNSPECIFIED = 0, // 无效状态
  SHEET_STATUS_NOT_SUBMITTED = 1, // 未提交(草稿)
  SHEET_STATUS_SUBMITTED = 2, // 已提交(待审核) 已借出/已归还/退货入库提交
  // 所有记录型的单据的提交状态 (修改库存)
  SHEET_STATUS_NOT_APPROVED = 3, // 审核不通过（被驳回）
  SHEET_STATUS_APPROVED = 4, // 审核通过/
  SHEET_STATUS_CANCEL_APPROVAL = 5, // 反审核 (修改库存)

  SHEET_STATUS_DELETED = 6, // 冲销/删除
  SHEET_STATUS_PAID = 7, // 已结款 已废弃
}
