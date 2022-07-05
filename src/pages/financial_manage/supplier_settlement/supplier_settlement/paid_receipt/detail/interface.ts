import { DiscountState } from '@/pages/sales_invoicing/components'
import { SettleSheet } from 'gm_api/src/finance'
import { StockSheet } from 'gm_api/src/inventory'

interface PaidReceiptDetail extends SettleSheet {
  supplier_name: string
  supplier_delete_time: string
  supplier_customized_code: string
}

type RelatedReceiptList = StockSheet

interface Discount extends DiscountState {
  create_time?: string
  creator_id?: string
  amount_discount_id?: string
}

export type { PaidReceiptDetail, Discount, RelatedReceiptList }
