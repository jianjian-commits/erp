import { ListDataItem } from '@gm-pc/react'
import { Unit } from 'gm_api/src/merchandise'

export interface MerchandiseShape {
  /** React 所需要的 key */
  key: string
  /** 当前这条数据所在原数据中的索引位置 */
  rawIndex: number
  /** 商品编码 */
  commodityCode: string
  /** 商品名 */
  name: string
  /** 单价 */
  price: string
  /** 当前商品所选择的单位 */
  unitName: string
  /** 当前商品所选择的单位 id */
  unitId: string
  /** 数量 */
  count: string
  /** 加单金额 */
  amount: string
  /** 商品名 select 所选择的 */
  skuId?: string
  /** 下单单位列表（Select 组件使用） */
  units?: Units
  /** 是否可以选择单位 */
  canChooseUnit?: boolean
  /** 是否为新增的商品 */
  isNewItem?: boolean
}
export type Units = (Unit & ListDataItem<any>)[]
export type Key = NonNullable<MerchandiseShape['key']>
