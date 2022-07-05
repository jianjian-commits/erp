import { t } from 'gm-i18n'
import { AccountType, TransactionFlow_ChangeType } from 'gm_api/src/finance'

export const ACCOUNT_TYPE: ObjectOfKey<string> = {
  [AccountType.ACCOUNT_TYPE_CUSTOMER]: t('餐饮客户'),
  [AccountType.ACCOUNT_TYPE_SUPPLIER]: t('供应商'),
}

export const TransactionFlowMap: ObjectOfKey<string> = {
  [TransactionFlow_ChangeType.CHANGE_TYPE_RECHARGE]: t('充值'),
  [TransactionFlow_ChangeType.CHANGE_TYPE_REFUND]: t('冲账'),
  [TransactionFlow_ChangeType.CHANGE_TYPE_SETTLE]: t('结款'),
  [TransactionFlow_ChangeType.CHANGE_TYPE_DEDUCTION]: t('扣款'),
}

export interface ObjectOfKey<T> {
  [key: number]: T
  [key: string]: T
}
