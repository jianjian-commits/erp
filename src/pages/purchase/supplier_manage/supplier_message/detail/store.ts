import { Sku } from 'gm_api/src/merchandise'
import {
  CreateSupplier,
  ListProvince,
  GetGroup,
  Province,
  DeleteReleationCustomerAndSupplier,
  Group_Attrs,
  Supplier,
  UpdateSupplier,
  GetRelationSupplier,
  DeleteSupplier,
  GetSupplier,
} from 'gm_api/src/enterprise'
import { ListSupplierUpperLimit } from 'gm_api/src/purchase'
import { EncodeShortText } from 'gm_api/src/toolbox'
import { GetWxaCodeUnlimit } from 'gm_api/src/wechat'
import _ from 'lodash'
import { makeAutoObservable, action } from 'mobx'
import {
  SupplierFormType,
  ComPurchaser,
  ContactMsg,
  SupplierGroupMsg,
} from '../interface'
import { t } from 'gm-i18n'
import globalStore from '@/stores/global'
import type { Warehouse } from 'gm_api/src/inventory'
import moment from 'moment'
import { UploadFileStatus } from 'antd/lib/upload/interface'
import { toFixed } from '@/common/util'

const initSupplierDetail: SupplierFormType = {
  name: '',
  customized_code: '',
  phone: '',
  country_id: '',
  province_id: '11', // 默认北京市
  city_id: '0',
  invoice_type: 2, // 发票类型 0 不开发票 2 开发票  默认选择2
  credit_type: 3, // 结款方式
  bank_name: '', // 开户银行名称
  bank_account: '', // 开户银行账号
  available_category_ids: [],
  settings: {
    code: false,
    name: false,
    // sorting_number: false,
    receiver: false,
    phone: false,
    order_price: false,
  },
  warehouse_id: undefined,
  period_of_validity_begin_time: moment().startOf('year').toDate(), // 资质有效时间
  period_of_validity_end_time: moment().endOf('year').toDate(),
  qualification_images: [],
}

const initSupplierGroupMsg: SupplierGroupMsg = {
  name: '',
  contact_msg: [],
}

interface SelectDataType {
  text: string
  value: string
}

class Store {
  supplier: any = {}
  supplierDetail: SupplierFormType = { ...initSupplierDetail }
  supplierGroupMsg: SupplierGroupMsg = { ...initSupplierGroupMsg }
  purchasers: ComPurchaser[] = []
  provinceSelectData: SelectDataType[] = []
  settingsSelect = []
  image = ''
  warehouses: Warehouse[] = []
  /** @description 经营的商品 */
  merchandiseList: Sku[] = []
  /** @description 选中的商品 */
  selectSkuList: Sku[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** @description 设置选择的商品 */
  setMerchandiseList(merchandiseList: Sku[]) {
    this.merchandiseList = _.cloneDeep(merchandiseList)
  }

  /** @description 设置选中的商品 */
  seSelectSkuList(selectSkuList: Sku[]) {
    this.selectSkuList = _.cloneDeep(selectSkuList)
  }

  clear() {
    this.supplierDetail = { ...initSupplierDetail }
    this.supplierGroupMsg = { ...initSupplierGroupMsg }
    this.merchandiseList = []
    this.selectSkuList = []
  }

  getWarehouses(warehouses: Warehouse[]) {
    this.warehouses = warehouses
  }

  getCountryId(group_id: string) {
    return GetGroup({ group_id }).then((res) => {
      const country_id = res.response.group.country_id!
      // this.supplierDetail.country_id = country_id
      return country_id
    })
  }

  getProvinceList(country_id: string) {
    return ListProvince({ country_id }).then((res) => {
      this.supplierDetail.country_id = country_id
      const provinces = res.response.provinces
      return provinces
    })
  }

  sortRegionSelectData(provinces: Province[]) {
    const provinceSelectData = provinces.map((province) => {
      return { text: province.local_name, value: province.province_id }
    })
    this.provinceSelectData = provinceSelectData
  }

  changeSupplierDetail<T extends keyof SupplierFormType>(
    name: T,
    value: SupplierFormType[T],
  ) {
    this.supplierDetail[name] = value
  }

  @action
  encodeText() {
    const original_text = `group_id=${globalStore.userInfo.group_id}&supplier_id=${this.supplier.supplier_id}`
    return EncodeShortText({ original_text }).then((res) => {
      return res.response.short_text || ''
    })
  }

  @action
  getWechatCode(scene: string) {
    return GetWxaCodeUnlimit({ app_id: 'wx120de18252ad9201', scene }).then(
      (res) => {
        const image = res.response.image
        this.image = 'data:image/jpeg;base64,' + image
        return res.response
      },
    )
  }

  deleteRelation() {
    return DeleteReleationCustomerAndSupplier({
      supplier_id: this.supplier.supplier_id,
    }).then((res) => {
      return res.response
    })
  }

  generateContactMsg(attrs: Group_Attrs) {
    const main_contact = attrs.main_contact
    const daily_contact = attrs.daily_contact
    const urgent_contact = attrs.urgent_contact
    const contact_msg: ContactMsg[] = [
      {
        type: t('主要负责人'),
        name_job: [main_contact?.name || '', main_contact?.job_title || ''],
        phone: main_contact?.phone || '',
      },
      {
        type: t('日常对接联系人'),
        name_job: [daily_contact?.name || '', daily_contact?.job_title || ''],
        phone: daily_contact?.phone || '',
      },
      {
        type: t('紧急对接联系人'),
        name_job: [urgent_contact?.name || '', urgent_contact?.job_title || ''],
        phone: urgent_contact?.phone || '',
      },
    ]
    return contact_msg
  }

  // 回显
  generateSupplierForm(supplier: Supplier) {
    const {
      attrs,
      period_of_validity_end_time,
      period_of_validity_begin_time,
    } = supplier
    return {
      ..._.pick(supplier, [
        'name',
        'customized_code',
        'phone',
        'credit_type',
        'settings',
        'supplier_id',
        'warehouse_id',
      ]),
      ..._.pick(supplier.address, [
        'country_id',
        'province_id',
        'city_id',
        'address',
      ]),
      ..._.pick(supplier.attrs?.china_vat_invoice, [
        'invoice_type',
        'bank_name',
        'bank_account',
      ]),
      ..._.pick(supplier.attrs, ['available_category_ids']),
      qualification_images: attrs?.qualification_images?.map((item, index) => ({
        uid: `-${index + 1}`,
        name: `image_${index}`,
        status: 'done' as UploadFileStatus,
        url: `https://qncdn.guanmai.cn/${item.path}?imageView2/3/w/70`,
        response: {
          key: item.path,
        },
      })),
      period_of_validity_begin_time: moment(
        Number(period_of_validity_begin_time),
      ).toDate(),
      period_of_validity_end_time: moment(
        Number(period_of_validity_end_time),
      ).toDate(),
    }
  }

  // 处理编辑时候的传参
  sortUpdateDataFromSupplierFrom() {
    return {
      ...this.supplier,
      ..._.pick(this.supplierDetail, [
        'name',
        'customized_code',
        'phone',
        'credit_type',
        'settings',
        'warehouse_id',
      ]),
      address: {
        ...this.supplier.address,
        ..._.pick(this.supplierDetail, [
          'country_id',
          'province_id',
          'city_id',
          'address',
        ]),
      },
      attrs: {
        ...this.supplier.attrs,
        ..._.pick(this.supplierDetail, [
          // 'available_category_ids',
          'main_contact',
          'daily_contact',
          'urgent_contact',
        ]),
        china_vat_invoice: {
          ...this.supplier.attrs.china_vat_invoice,
          ..._.pick(this.supplierDetail, [
            'invoice_type',
            'bank_name',
            'bank_account',
          ]),
        },
        qualification_images: this.supplierDetail.qualification_images?.map(
          (item) => ({
            path: item.response.key,
            type: 1,
          }),
        ),
      },
      period_of_validity_begin_time: `${+this.supplierDetail
        .period_of_validity_begin_time!}`,
      period_of_validity_end_time: `${+this.supplierDetail
        .period_of_validity_end_time!}`,
    }
  }

  // 新建时候传的参数
  sortCreateDataFromSupplierForm() {
    return {
      ..._.pick(this.supplierDetail, [
        'name',
        'customized_code',
        'phone',
        'credit_type',
        'settings',
        'warehouse_id',
      ]),
      address: _.pick(this.supplierDetail, [
        'country_id',
        'province_id',
        'city_id',
        'address',
      ]),
      attrs: {
        ..._.pick(this.supplierDetail, [
          // 'available_category_ids',
          'main_contact',
          'daily_contact',
          'urgent_contact',
        ]),
        china_vat_invoice: _.pick(this.supplierDetail, [
          'invoice_type',
          'bank_name',
          'bank_account',
        ]),
        qualification_images: this.supplierDetail.qualification_images?.map(
          (item) => ({
            path: item.response.key,
            type: 1,
          }),
        ),
      },
      period_of_validity_begin_time: `${+this.supplierDetail
        .period_of_validity_begin_time!}`,
      period_of_validity_end_time: `${+this.supplierDetail
        .period_of_validity_end_time!}`,
    }
  }

  // 回显
  getSupplier(id: string) {
    return GetSupplier({ supplier_id: id }).then((json) => {
      const supplier = json.response.supplier
      this.supplier = supplier
      this.supplierDetail = this.generateSupplierForm(supplier)
      return json.response
    })
  }

  // 回显
  getSupplierLimit(supplier_id: string) {
    return ListSupplierUpperLimit({
      filter_params: {
        supplier_id,
      },
    }).then((res) => {
      const sku_map = res.response.sku_map || {}
      this.merchandiseList = Object.values(
        res.response.supper_upper_limits,
      ).map((item) => ({
        ...item,
        ...sku_map[item.sku_id],
        upper_limit: toFixed(Number(item.upper_limit), 4) + '',
      }))
    })
  }

  createSupplier() {
    return CreateSupplier({
      supplier: this.sortCreateDataFromSupplierForm() as Supplier,
    })
  }

  updateSupplier() {
    return UpdateSupplier({ supplier: this.sortUpdateDataFromSupplierFrom() })
  }

  getSupplierGroupMsg(group_id: string, relation_group_id: string) {
    return GetRelationSupplier({ group_id, relation_group_id }).then((res) => {
      const name = res.response.supplier?.name || ''
      const attrs = res.response.supplier?.attrs || {}
      this.supplierGroupMsg = {
        name,
        contact_msg: this.generateContactMsg(attrs),
      }
      return name
    })
  }

  deleteSupplier(supplier_id: string) {
    return DeleteSupplier({ supplier_id })
  }
}

export default new Store()
