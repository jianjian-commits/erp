import {
  Supplier,
  GroupUser,
  CreditType,
  ChinaVatInvoice_InvoiceType,
  Supplier_SupplierSettings,
} from 'gm_api/src/enterprise'

import { UploadFile } from 'antd/lib/upload/interface'

import { MoreSelectDataItem } from '@gm-pc/react'
export interface SupplierListType {
  supplier_id: string
  name?: string // 供应商名称
  customized_code?: string // 供应商编号
  phone?: string // 联系电话
  category1_name?: string // 一级商品分类名称组成的字符串
  available_category_ids?: string[] // 经营品类
}

export interface BatchMerchandiseParams {
  category_id: string[]
  q: string
}
export interface SupplierFormType {
  // supplier_id?: string
  name: string // 供应商名称
  customized_code?: string // 供应商编号
  country_id?: string
  province_id?: string
  city_id?: string
  address?: string // 详细地址
  phone?: string // 联系电话
  invoice_type?: ChinaVatInvoice_InvoiceType // 发票类型
  credit_type?: CreditType // 付款方式
  bank_name?: string // 开户银行名称
  bank_account?: string // 开户银行账号
  available_category_ids?: string[] // 经营品类
  settings?: Supplier_SupplierSettings // 供应商权限
  category1_name?: string // 一级商品分类名称组成的字符串
  warehouse_id?: string
  period_of_validity_begin_time?: Date // 资质有效时间
  period_of_validity_end_time?: Date
  qualification_images?: UploadFile[]
  // main_contact?: Group_Contact // 主要负责人
  // daily_contact?: Group_Contact // 日常对接负责人
  // urgent_contact?: Group_Contact // 紧急对接联系人
  // contact_msg?: ContactMsg[]
  // group_id: string
}

export interface SupplierGroupMsg {
  name: string
  contact_msg: ContactMsg[]
}

export interface ContactMsg {
  type: string
  name_job: string[]
  phone: string
}

export interface ComPurchaser extends MoreSelectDataItem<string>, GroupUser {}
