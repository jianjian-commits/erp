import { RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'
import { t } from 'gm-i18n'
import {
  ObjectOfKey,
  ReceiptStatusAll,
} from '@/pages/sales_invoicing/interface'
import { ListDataItem } from '@gm-pc/react'
import { SelectType } from './interface'

// 销售退货入库单据状态名
export const SALES_IN_RECEIPT_STATUS_NAME: ObjectOfKey<string> = {
  [RECEIPT_STATUS.all]: t('全部'),
  [RECEIPT_STATUS.toBeSubmitted]: t('待入库'),
  [RECEIPT_STATUS.submitted]: t('已入库'),
  [RECEIPT_STATUS.deleted]: t('已删除'),
}

// 销售退货入库列表页状态tab
export const SALES_IN_RECEIPT_TABS: Partial<ReceiptStatusAll<string>> = {
  all: t('全部'), // 全部
  toBeSubmitted: t('待提交'),
  submitted: t('已入库'), // 审核通过（如：已入库）
  deleted: t('已删除'), // 已删除
}

// 可修改的入库状态名
export const SALES_IN_STOCK_STATUS_NAME: ListDataItem<number>[] = [
  { value: RECEIPT_STATUS.toBeSubmitted, text: t('待入库') },
  { value: RECEIPT_STATUS.submitted, text: t('已入库') },
  { value: RECEIPT_STATUS.deleted, text: t('已删除') },
]

export const SELECT_TYPE: { value: SelectType; text: string }[] = [
  { value: 'order_serial_no_q', text: t('订单号') },
  { value: 'q', text: t('退货入库单号') },
]
