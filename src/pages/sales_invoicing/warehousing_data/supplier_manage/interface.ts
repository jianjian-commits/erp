import { Supplier, GroupUser } from 'gm_api/src/enterprise'

import { MoreSelectDataItem } from '@gm-pc/react'
import { Image } from 'gm_api/src/common'

export interface SupplierItem extends Supplier {
  company_name?: string // 公司名称
  company_address?: string // 公司地址
  company_phone?: string // 公司电话
  invoice_type?: number // 发票类型
  taxpayer_identity_number?: string // 纳税人识别号
  bank_name?: string // 开户银行名称
  bank_account?: string // 开户银行账号
  bank_card_owner_name?: string // 银行卡持有人名称
  max_invoice_amount?: string // 最大发票金额
  business_license_number?: string // 营业执照号
  financial_contact_name?: string // 财务联系人名称
  financial_contact_phone?: string // 财务联系人电话
  taxpayer_type?: number // 纳税人类型
  available_category_ids: string[] // 商品
  qualification_images?: (Image & { url: string })[]
  map_address?: string
  location_latitude?: string
  location_longitude?: string
  // invoice_type?: string
}

export interface ComPurchaser extends MoreSelectDataItem<string>, GroupUser {}
