import { MoreSelectDataItem } from '@gm-pc/react'
import { ListSkuResponse_SkuInfo, Sku } from 'gm_api/src/merchandise'
import { Bom, BomType, ListBomRequest } from 'gm_api/src/production'

/**
 * 扩展的BOM
 * @extends {BOM}
 */
export interface BomExpand extends Bom {
  /** 是否存在被删除的原料 */
  haveDeleteMaterial: boolean
  /** 商品信息 */
  skuInfo?: ListSkuResponse_SkuInfo
  /** 工序模板名 */
  processTemplateName?: string
  /** 原料的Map */
  materials?: { [key: string]: Sku }
  /** 包材 */
  packMaterials?: Sku[]
  /** 默认bom  */
  isDefault: boolean
  /** 产线名称 */
  production_line: string
}

/**
 * 扩展的获取BOM列表的请求参数
 * @extends {Omit<ListBomRequest, 'paging'>}
 */
export interface ListBomRequestExpand extends Omit<ListBomRequest, 'paging'> {
  /** 商品名 */
  skuArray?: MoreSelectDataItem<string>[]
  /** 原料或包材 */
  materialSkuArray?: MoreSelectDataItem<string>[]
  /** 客户 */
  customerArray?: MoreSelectDataItem<string>[]
  /** 工序模板 */
  processTemplateArray?: MoreSelectDataItem<string>[]
  /** BOM的种类 */
  type?: BomType
  /** 是否在全部标签页 */
  isAll?: boolean
}
