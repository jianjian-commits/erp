import { SettleSheet, SettleSheet_SheetStatus } from 'gm_api/src/finance'
import { Customer_Type, CreditType } from 'gm_api/src/enterprise'
export interface levelList {
  value: string
  text: string
  children?: levelList[]
}

export interface BatchProps {
  selected: string[]
  isSelectAll: boolean
}

export interface FilterOptions {
  begin_time: Date
  end_time: Date
  time_type: number
  search_text?: string
  credit_type?: CreditType // 结款周期
  status?: SettleSheet_SheetStatus // 状态
  target_id?: string
  customers: any
}

export interface ListOptions extends SettleSheet {
  company?: string
  company_type?: Customer_Type
}

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
