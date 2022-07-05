import { t } from 'gm-i18n'
import _ from 'lodash'
import { ObjectOfKey } from '../../interface'
import { parseSelectData } from '../../utils'
import { SettlementStatusAll } from './interface'
import { SettleSheet_SheetStatus } from 'gm_api/src/finance'
import { Customer_Type } from 'gm_api/src/enterprise'

// 以下枚举暂未对proto
// 结款状态
export const SETTLE_SHEET_STATUS: ObjectOfKey<string> = {
  [SettleSheet_SheetStatus.SHEET_STATUS_NOT_SUBMITTED]: t('待提交'),
  [SettleSheet_SheetStatus.SHEET_STATUS_SUBMITTED_NOT_PAID]: t('已提交待结款'),
  [SettleSheet_SheetStatus.SHEET_STATUS_PAID]: t('已结款'),
  [SettleSheet_SheetStatus.SHEET_STATUS_PART_PAID]: t('部分结款'),
  [SettleSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED]: t('审核不通过'),
  [SettleSheet_SheetStatus.SHEET_STATUS_DELETED]: t('已删除'),
}

export const COMPANY_TYPE: ObjectOfKey<string> = {
  [Customer_Type.TYPE_SOCIAL]: t('餐饮客户'),
  [Customer_Type.TYPE_SCHOOL]: t('学生餐饮'),
  [Customer_Type.TYPE_CLASS]: t('学生餐饮'),
}

// 锁定状态
export const lockStatusMap: ObjectOfKey<string> = {
  1: t('AA'),
  2: t('BB'),
  3: t('CC'),
}

export const SETTLEMENT_TABS: SettlementStatusAll<string> = {
  ALL: t('全部'),
  TO_BE_SUBMITTED: t('待提交'), // 待提交
  FAILED_TO_PASS: t('审核不通过'), // 审核不通过
  TO_BE_SETTLEMENT: t('已提交待结款'), // 已提交待结款
  PARTIAL_SETTLEMENT: t('部分结款'), // 部分结款
  SETTLED_ACCOUNT: t('已结款'), // 已结款
  DELETE: t('删除'), // 删除
}

export const SETTLEMENT_STATUS: SettlementStatusAll<number> = {
  ALL: SettleSheet_SheetStatus.SHEET_STATUS_UNSPECIFIED,
  TO_BE_SUBMITTED: SettleSheet_SheetStatus.SHEET_STATUS_NOT_SUBMITTED, // 待提交
  TO_BE_SETTLEMENT: SettleSheet_SheetStatus.SHEET_STATUS_SUBMITTED_NOT_PAID, // 已提交待结款
  SETTLED_ACCOUNT: SettleSheet_SheetStatus.SHEET_STATUS_PAID, // 已结款
  PARTIAL_SETTLEMENT: SettleSheet_SheetStatus.SHEET_STATUS_PART_PAID, // 部分结款
  FAILED_TO_PASS: SettleSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED, // 审核不通过
  DELETE: SettleSheet_SheetStatus.SHEET_STATUS_DELETED, // 删除
}

export const settlementStatus = parseSelectData(SETTLE_SHEET_STATUS)
export const lockStatus = parseSelectData(lockStatusMap)
