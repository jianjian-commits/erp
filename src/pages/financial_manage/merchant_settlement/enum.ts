import { t } from 'gm-i18n'
import { ObjectOfKey } from './interface'
import { CreditType } from 'gm_api/src/enterprise'
import { parseSelectData } from './utils'

export const CreditTypeMap: ObjectOfKey<string> = {
  // [CreditType.CREDIT_TYPE_UNSPECIFIED]: t('全部'),
  [CreditType.CREDIT_TYPE_DAILY]: t('日结'),
  [CreditType.CREDIT_TYPE_WEEKLY]: t('周结'),
  [CreditType.CREDIT_TYPE_MONTHLY]: t('月结'),
  [CreditType.CREDIT_TYPE_HALF_MONTHLY]: t('半月结'),
}

export const Credit_Type = parseSelectData(CreditTypeMap)
