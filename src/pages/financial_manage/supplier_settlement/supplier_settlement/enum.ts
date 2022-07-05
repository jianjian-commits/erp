import { RECEIPT_TYPE } from '@/pages/sales_invoicing/enum'
import { ListDataItem } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { CreditType } from 'gm_api/src/enterprise'
import {
  SettleSheet_AmountDiscount_DiscountReason,
  SettleSheet_AmountDiscount_DiscountType,
  SettleSheet_SheetStatus,
} from 'gm_api/src/finance'

export const SHEET_TYPE: ListDataItem<number>[] = [
  { value: RECEIPT_TYPE.purchaseIn, text: t('采购入库单') },
  { value: RECEIPT_TYPE.purchaseRefundOut, text: t('采购退货单') },
]

export const DISCOUNT_REASON_ENUM: ListDataItem<SettleSheet_AmountDiscount_DiscountReason>[] = [
  {
    value: SettleSheet_AmountDiscount_DiscountReason.DISCOUNT_REASON_ALLOWANCE,
    text: t('供应商折扣'),
  },
  {
    value:
      SettleSheet_AmountDiscount_DiscountReason.DISCOUNT_REASON_REMOVE_ZERO,
    text: t('抹零'),
  },
  {
    value: SettleSheet_AmountDiscount_DiscountReason.DISCOUNT_REASON_CAL_ERROR,
    text: t('供应商计算异常'),
  },
  {
    value: SettleSheet_AmountDiscount_DiscountReason.DISCOUNT_REASON_FINE,
    text: t('供应商罚款'),
  },
  {
    value: SettleSheet_AmountDiscount_DiscountReason.DISCOUNT_REASON_OTHER,
    text: t('其他'),
  },
]

export const DISCOUNT_ACTION_ENUM: ListDataItem<SettleSheet_AmountDiscount_DiscountType>[] = [
  {
    value: SettleSheet_AmountDiscount_DiscountType.DISCOUNT_TYPE_ADD_AMOUNT,
    text: t('加钱'),
  },
  {
    value: SettleSheet_AmountDiscount_DiscountType.DISCOUNT_TYPE_DELTA_AMOUNT,
    text: t('扣钱'),
  },
]

export const SETTLE_SHEET_STATUS = [
  {
    value: SettleSheet_SheetStatus.SHEET_STATUS_UNSPECIFIED,
    text: t('全部'),
  },
  {
    value: SettleSheet_SheetStatus.SHEET_STATUS_NOT_SUBMITTED,
    text: t('待提交'),
  },
  {
    value: SettleSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED,
    text: t('审核不通过'),
  },
  {
    value: SettleSheet_SheetStatus.SHEET_STATUS_SUBMITTED_NOT_PAID,
    text: t('已提交待结款'),
  },
  {
    value: SettleSheet_SheetStatus.SHEET_STATUS_PART_PAID,
    text: t('部分结款'),
  },
  { value: SettleSheet_SheetStatus.SHEET_STATUS_PAID, text: t('已结款') },
  { value: SettleSheet_SheetStatus.SHEET_STATUS_DELETED, text: t('已删除') },
]

export const SUPPLIER_CREDIT_TYPE = [
  { value: CreditType.CREDIT_TYPE_DAILY, text: t('日结') },
  { value: CreditType.CREDIT_TYPE_WEEKLY, text: t('周结') },
  { value: CreditType.CREDIT_TYPE_MONTHLY, text: t('月结') },
  { value: CreditType.CREDIT_TYPE_HALF_MONTHLY, text: t('半月结') },
]
