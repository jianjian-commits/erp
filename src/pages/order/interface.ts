import {
  OrderDetail,
  Order,
  Order_State,
  Order_PayState,
} from 'gm_api/src/order'
import { MoreSelectDataItem } from '@gm-pc/react'
import { Customer } from 'gm_api/src/enterprise'
import {
  Quotation,
  MenuPeriodGroup,
  Unit,
  Menu,
  Sku,
} from 'gm_api/src/merchandise'

/**
 * 原则上可复用的类型放在这个文件
 * 历史原因，许多类型在各个组件目录下单独定义了
 */

/**
 * 许多筛选form的基本结构
 */
export interface FilterOptions {
  begin: Date
  end: Date
  dateType: number
  status: Order_State
  pay_status: Order_PayState
  is_out_stock: string
  serial_no: string
  receive_customer_id: string
  app_id: string
  customers: MoreSelectDataItem<string>[]
  sale_menus: MoreSelectDataItem<string>[]
  drivers: MoreSelectDataItem<string>[]
  menu_period_group_ids: MoreSelectDataItem<string>[]
  sort_remark: string
  service_period_id: string
  route: Array<any>
  order_type: MoreSelectDataItem<string>[]
  customize_type_ids: MoreSelectDataItem<string>[]
}

export interface BatchProps {
  selected: string[]
  isSelectAll: boolean
}

/**
 * OrderDetail,order里面的基本单位，相当于单个sku
 */
export interface SkuDetail extends OrderDetail, Omit<Sku, 'sku_id'> {
  canDelete?: boolean
  editing?: boolean
  order?: Order
  customer: Customer
  quotation: Quotation
  menu?: Menu
  menu_period_group?: MenuPeriodGroup
  parentUnit?: Unit
  unit?: Unit
  quotationName?: string
  /**
   * 下单数
   */
  quantity?: string | number
  /**
   * 单价(定价)
   */
  price?: string | number
  /**
   * 非辅助单位出库数unitId
   */
  std_unit_id?: string
  /**
   * 辅助单位出库数unitId
   */
  std_unit_id_second?: string
  /**
   * 出库数（基本单位组，自定义单位）
   */
  std_quantity?: string | number
  /**
   * 辅助单位出库数
   */
  std_quantity_second?: string | number
  isUsingSecondUnitOutStock?: boolean
  /** 线路信息 */
  route?: {
    routeId?: string
    name?: string
  }
}

export interface ViewOrderNoProps {
  serial_no?: string
  customer_img_url?: string
  state?: number
  status?: string
  sign_img_url?: string
}

// ------------------------------------------------------------
