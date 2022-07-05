import { CategoryTreeCache_CategoryInfo, Sku } from 'gm_api/src/merchandise'
import {
  MaterialOrderDetail,
  MaterialOrderDetail_MaterialDetail,
  PrintMaterialOrderResponse_Sheet,
} from 'gm_api/src/production'

type MaterialDetailInfo = MaterialOrderDetail_MaterialDetail & { skuInfo?: Sku }

export type materialOrderDetailsType =
  | MaterialOrDetailPrint
  | MaterialOrDetailPrint[]
export interface MaterialOrDetailPrint
  extends Omit<MaterialOrderDetail, 'sku_details' | 'material_details'> {
  skuInfo?: Sku
  categoryInfo?: CategoryTreeCache_CategoryInfo
  sku_details: MaterialDetailInfo[]
  material_details: MaterialDetailInfo[]
}

export interface PrintMaterialOrderSheet
  extends Omit<PrintMaterialOrderResponse_Sheet, 'material_order_details'> {
  material_order_details: materialOrderDetailsType[]
}
