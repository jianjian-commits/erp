import { t } from 'gm-i18n'
import { RECEIPT_TYPE } from '@/pages/sales_invoicing/enum'
interface EnumDate {
  value: number
  text: string
}

export const storageType: EnumDate[] = [
  { value: RECEIPT_TYPE.purchaseIn, text: t('采购入库') },
  { value: RECEIPT_TYPE.productIn, text: t('生产入库') },
  { value: RECEIPT_TYPE.otherIn, text: t('其他入库') },
]

export const ExpectedType: EnumDate[] = [
  { value: 0, text: t('全部预期库存') },
  { value: 1, text: t('在途库存') },
  { value: 2, text: t('冻结库存') },
]

export const QuantityFilter: EnumDate[] = [
  { value: 0, text: t('全部批次') },
  { value: 1, text: t('库存大于0的批次') },
  { value: 2, text: t('库存等于0的批次') },
]

export type { EnumDate }
