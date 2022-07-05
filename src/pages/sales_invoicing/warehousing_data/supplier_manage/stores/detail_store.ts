import { GetCategoryTree, Category } from 'gm_api/src/merchandise'

import {
  CreateSupplier,
  DeleteSupplier,
  GetSupplier,
  InvoiceSetting,
  Supplier,
  UpdateSupplier,
} from 'gm_api/src/enterprise'
import _ from 'lodash'

import { makeAutoObservable } from 'mobx'
import { SupplierItem, ComPurchaser } from '../interface'
import { formatDataToTree } from '@/common/util'
import { adapterSupplierItem } from '../util'
import { TreeListItem } from '@gm-pc/react'

const initSupplierDetail: SupplierItem = {
  supplier_id: '',
  name: '',
  phone: '',
  company_name: '',
  company_address: '',
  invoice_type: 2, // 发票类型 0 不开发票 2 开发票  默认选择2
  taxpayer_identity_number: '', // 纳税人识别号
  bank_name: '', // 开户银行名称
  bank_account: '', // 开户银行账号
  bank_card_owner_name: '', // 银行卡持有人名称
  max_invoice_amount: '', // 最大发票金额
  business_license_number: '', // 营业执照号
  financial_contact_name: '', // 财务联系人名称
  financial_contact_phone: '', // 财务联系人电话
  taxpayer_type: 1, // 纳税人类型
  credit_type: 3,
  // invoice_type: InvoiceSetting.INVOICESETTING_SPECIAL,

  available_category_ids: [],
  customized_code: '',
  map_address: '',
  location_latitude: '',
  location_longitude: '',
  qualification_images: [],
}

class Store {
  supplierDetail: SupplierItem = { ...initSupplierDetail }
  purchasers: ComPurchaser[] = []
  categoryTree: (Category & TreeListItem)[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clear() {
    this.supplierDetail = { ...initSupplierDetail }
    this.categoryTree = []
  }

  changeSupplierDetail<T extends keyof SupplierItem>(
    name: T,
    value: SupplierItem[T],
  ) {
    this.supplierDetail[name] = value
  }

  getData(): Supplier {
    const {
      status,
      create_time,
      update_time,
      delete_time,
      group_id,
      supplier_id,
      customized_code,
      name,

      address,
      credit_type,
      description,
      is_valid,
      available_category_ids,
      company_name,
      company_address,
      company_phone,
      invoice_type,
      taxpayer_identity_number,
      bank_name,
      bank_account,
      bank_card_owner_name,
      max_invoice_amount,
      business_license_number,
      financial_contact_name,
      financial_contact_phone,
      taxpayer_type,
      map_address,
      location_latitude,
      location_longitude,
      phone,
      qualification_images,
      invoice_setting,
    } = this.supplierDetail
    return {
      create_time,
      update_time,
      delete_time,
      group_id,
      customized_code,
      status: status === '' ? undefined : status,
      supplier_id: supplier_id === '' ? undefined : supplier_id,
      name,
      address: {
        ...address,
        address: map_address!,
        geotag: {
          latitude: '' + location_latitude,
          longitude: '' + location_longitude,
        },
      },
      credit_type,
      description,
      is_valid,
      attrs: {
        china_vat_invoice: {
          company_name,
          company_address,
          company_phone,
          invoice_type,
          taxpayer_identity_number,
          bank_name,
          bank_account,
          bank_card_owner_name,
          max_invoice_amount,
          business_license_number,
          financial_contact_name,
          financial_contact_phone,
          taxpayer_type,
          invoice_setting,
        },
        available_category_ids,
        qualification_images: _.map(qualification_images, (item) => {
          const { url, ...rest } = item
          return { ...rest }
        }),
      },
      phone,
    }
  }

  deleteSupplier(supplier_id: string) {
    return DeleteSupplier({ supplier_id })
  }

  getSupplier(id: string) {
    return GetSupplier({ supplier_id: id }).then((json) => {
      this.supplierDetail = adapterSupplierItem(json.response.supplier!)
      return json
    })
  }

  fetchCategory() {
    return GetCategoryTree({}).then((json) => {
      this.categoryTree = formatDataToTree(
        json.response.categories!,
        'category_id',
        'name',
      )

      return json
    })
  }

  createSupplier() {
    return CreateSupplier({ supplier: this.getData() })
  }

  updateSupplier() {
    return UpdateSupplier({ supplier: this.getData() })
  }
}

export default new Store()
