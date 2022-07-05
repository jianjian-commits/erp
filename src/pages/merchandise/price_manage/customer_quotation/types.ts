import {
  Quotation,
  Ssu,
  ListSsuRequest,
  Quotation_Type,
} from 'gm_api/src/merchandise'

type FilterOptions = {
  quotation_q: string
  quotation_status: number
  quotation_type: Quotation_Type | ''
}

interface SaleCardOptions {
  quotation_id: string
  title: string
  label: string
  onDelete(quotation_id: string): void
  onSettingClick(quotation_id: string): void
  disabled?: boolean
  onClick(quotation_id: string): void
}

interface CardRowOptions {
  name: string
  content: string | number
}

interface QuotationProps extends Quotation {
  ssu_num?: number | string
}

interface ListSsuRequestOptions extends ListSsuRequest {
  sku_type: number
  process?: boolean
}

export {
  FilterOptions,
  SaleCardOptions,
  CardRowOptions,
  QuotationProps,
  ListSsuRequestOptions,
}
