import { t } from 'gm-i18n'
import { ObjectOfKey } from '../../interface'
import { TransactionFlow_ChangeType } from 'gm_api/src/finance'

export const TransactionFlowMap: ObjectOfKey<string> = {
  // [CreditType.CREDIT_TYPE_UNSPECIFIED]: t('全部'),
  // [TransactionFlow_ChangeType.CHANGE_TYPE_RECHARGE]: t('日结'),
  [TransactionFlow_ChangeType.CHANGE_TYPE_REFUND]: t('冲账'),
  [TransactionFlow_ChangeType.CHANGE_TYPE_SETTLE]: t('结款'),
  // [TransactionFlow_ChangeType.CHANGE_TYPE_DEDUCTION]: t('扣款'),
}
