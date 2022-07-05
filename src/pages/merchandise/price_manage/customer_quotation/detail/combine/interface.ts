import { UnitGlobal } from '@/stores/global'
import {
  BasicPriceItem,
  Sku,
  BulkUpdateBasicPriceV2Request,
} from 'gm_api/src/merchandise'

export interface DetailModalRef {
  openModal: () => void
}
export interface QuotaionProps {
  handleVerify: () => Promise<any>
}

export interface BoundTableFormFieldsItem {
  price: number | undefined
  fee_unit_price: { unit_id: string }
}
export interface BoundCombineChildrenType extends BasicPriceItem {
  priceUnitList?: UnitGlobal[]
  sku_id: string
  name: string
  isBound: boolean
  orderUnitName: string
  priceUnitName?: string
  ratio: string
  price?: number
  quotation_id?: string
  on_sale?: boolean
}
export interface BoundCombineDataType extends Sku {
  combineSkus: string
  basic_price_id?: string
  isAllSkuBound?: boolean
  isAllOnSale?: boolean
  isAllOnShelf?: boolean
  totalPrice: number
  on_shelf?: boolean
  quotation?: string
  quotation_id?: string
  items: BoundCombineChildrenType[]
  combineItem?: BasicPriceItem[]
}

export interface BatchParmas extends BulkUpdateBasicPriceV2Request {
  isAll: boolean
}

export interface FilterParams {
  q: string
  on_shelf: number | undefined
}
