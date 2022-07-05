import { makeAutoObservable, action } from 'mobx'
import {
  ListBasicPrice,
  ListBasicPriceV2,
  ExportBasicPriceV2,
  Quotation_Status,
  UpdateQuotationBasicPrice,
  ImportQuotationCreateBySsu,
  ImportQuotationChangeBySsu,
  ExportQuotationBySsu,
  DeleteBasicPrice,
  DeleteBasicPriceRequest,
  Status_Code,
  Quotation_Type,
  ListBasicPriceV2Request,
  ListBasicPriceV2Response,
} from 'gm_api/src/merchandise'
import type {
  ListBasicPriceRequest,
  BasicPrice,
  ListBasicPriceResponse,
  Quotation,
} from 'gm_api/src/merchandise'
import { Filters_Bool } from 'gm_api/src/common'
import type { Supplier, GroupUser } from 'gm_api/src/enterprise'
import _ from 'lodash'
import moment from 'moment'

import globalStore from '@/stores/global'
import { toFixedByType, toFixed } from '@/common/util'
// import { FilterOptions } from './type'

export interface FilterOptions {
  start_time?: string
  end_time?: string
  // sku_q: string
  category: string[]
  category_id?: string
  supplier: any
  supplier_ids?: string[]
  // statuses: Quotation_Status[]
  quotation_type?: Quotation_Type
  q?: string
  quotation_status?: Quotation_Status
}

const initFilter: FilterOptions = {
  start_time: moment().startOf('day').add(-6, 'days').valueOf().toString(),
  end_time: moment().endOf('day').valueOf().toString(),
  q: '',
  category: [],
  supplier: [],
  supplier_ids: [],
  quotation_status: 0,
}

class Store {
  list: any = []
  filter = { ...initFilter }
  basic_prices: BasicPrice[] = []
  priceImportUploadUrl = ''
  priceImportType = 1
  listPriceParams: any = {}
  editPrice = ''
  editPkgPrice = ''
  importSupplier = []

  constructor() {
    makeAutoObservable(this)
  }

  resetData() {
    this.filter = { ...initFilter }
  }

  updateImportSupplier(supplier: any) {
    this.importSupplier = supplier
  }

  setEditPrice(price: string) {
    this.editPrice = price
  }

  updateFilter<T extends keyof FilterOptions>(
    key: T,
    value: FilterOptions[T],
  ): void {
    this.filter[key] = value
  }

  sortDataFromSupplier(
    supplier_id: string,
    supplier_relation: { [key: string]: Supplier },
  ) {
    const supplier = supplier_relation[supplier_id]
    const supplier_name = supplier?.name || ''
    return { supplier_name }
  }

  sortDataFromGroupUser(
    creator_id: string,
    group_user_relation: { [key: string]: GroupUser },
  ) {
    const groupUser = group_user_relation[creator_id]
    const operator = groupUser?.name || ''
    return { operator }
  }

  sortDataFromQuotationAndSupplierAndGroupUser(
    quotation_id: string,
    quotation_relation: { [key: string]: Quotation },
    supplier_relation: { [key: string]: Supplier },
    group_user_relation: { [key: string]: GroupUser },
  ) {
    const quotation = quotation_relation[quotation_id]
    const supplier_id = quotation.supplier_id || ''
    const creator_id = quotation.creator_id || ''
    return {
      ..._.pick(quotation, [
        'start_time',
        'end_time',
        'update_time',
        'status',
        'serial_no',
      ]),
      supplier_id,
      ...this.sortDataFromSupplier(supplier_id, supplier_relation),
      ...this.sortDataFromGroupUser(creator_id, group_user_relation),
    }
  }

  sortDataFromSsu(ssu: any) {
    const rate = ssu.unit.rate
    // 计量单位
    const meas_unit = globalStore.unitMap[ssu.unit.parent_id].name
    // 包装单位
    const pkg_unit = ssu.unit.name
    return { rate, meas_unit, pkg_unit }
  }

  sortDataFromSku(sku: any) {
    return _.pick(sku, ['customize_code', 'name'])
  }

  sortDataFromCategoryInfo(category_infos: any[]) {
    const category_name = category_infos
      .map((category_info: any) => category_info.category_name)
      .join('/')
    return { category_name }
  }

  sortListData(res: ListBasicPriceResponse) {
    const basic_prices = res.basic_prices
    const quotation_relation = res.quotation_relation || {}
    const supplier_relation = res.supplier_relation || {}
    const ssu_info_relation = res.ssu_info_relation || {}
    const group_user_relation = res.group_user_relation || {}

    this.basic_prices = basic_prices

    const list = basic_prices.map((basic_price: BasicPrice) => {
      const sku_id = basic_price.sku_id || ''
      const unit_id = basic_price.unit_id || ''
      const quotation_id = basic_price.quotation_id || ''
      const sku = ssu_info_relation[`${sku_id}:${unit_id}`].sku
      const ssu = ssu_info_relation[`${sku_id}:${unit_id}`].ssu
      const category_infos =
        ssu_info_relation[`${sku_id}:${unit_id}`].category_infos || []

      const data: any = {
        sku_id,
        quotation_id,
        price: toFixed(Number(basic_price.price), 2),
        ...this.sortDataFromSku(sku),
        ...this.sortDataFromQuotationAndSupplierAndGroupUser(
          quotation_id,
          quotation_relation,
          supplier_relation,
          group_user_relation,
        ),
        ...this.sortDataFromSsu(ssu),
        ...this.sortDataFromCategoryInfo(category_infos),
        isEditing: false,
      }
      data.pkgPrice = toFixed(data.price * data.rate, 2)
      return data
    })
    return list
  }

  sortCategoryParams(category: any) {
    let spu_ids = []
    let category_ids = []
    if (category.pinlei_ids?.length) {
      spu_ids = _.map(category.pinlei_ids, (v) => v.value)
    } else if (category.category2_ids?.length) {
      category_ids = _.map(category.category2_ids, (v) => v.value)
    } else if (category.category1_ids?.length) {
      category_ids = _.map(category.category1_ids, (v) => v.value)
    }
    return [spu_ids, category_ids]
  }

  sortListParams() {
    const { category, supplier, quotation_status } = this.filter
    const params: Omit<ListBasicPriceV2Request, 'paging'> = {
      filter_params: {
        ..._.pick(this.filter, ['start_time', 'end_time', 'q']),
        quotation_status,
        supplier_ids: supplier.map((e: any) => e.supplier_id),
        category_id: category[0],
      },
    }

    return params
  }

  setListBasicPriceParams(params: ListBasicPriceRequest) {
    this.listPriceParams = params
  }

  listData(res: ListBasicPriceV2Response) {
    const { sku_id, create_time } = res.basic_prices

    const list = []
  }

  @action
  fetchPriceList(params: ListBasicPriceRequest) {
    const req = {
      ...params,
      ...this.sortListParams(),
    }
    return ListBasicPriceV2(req).then((json) => {
      console.log(json, 'json')
      this.list = this.sortListData(json.response)
      this.list = this.listData(json.response)
      return json
    })
  }

  @action
  exportPriceList() {
    const request = {
      list_basic_price_v2_request: {
        ...this.sortListParams(),
        paging: { offset: 0, limit: 10, need_count: true },
      },
    }
    return ExportBasicPriceV2({ ...request }).then((json) => {
      return json.response
    })
  }

  @action
  deleteAgreementSheet(index: number, delete_relation_data?: Filters_Bool) {
    const basic_price = this.basic_prices[index]
    const basic_price_id = _.pick(basic_price, [
      'quotation_id',
      'sku_id',
      'unit_id',
    ])
    const req: DeleteBasicPriceRequest = { basic_price_ids: [basic_price_id] }
    if (delete_relation_data !== undefined)
      req.delete_relation_data = delete_relation_data
    return DeleteBasicPrice(req, [
      Status_Code.DELETE_BASIC_PRICE_RELATION_DATA,
    ]).then((res) => {
      return { response: res.response, code: res.code, msg: res.message }
    })
  }

  editMsg(index: number) {
    this.list.forEach((item: any, i: number) => {
      if (i === index) {
        item.isEditing = true
      } else {
        item.isEditing = false
      }
    })
    this.editPrice = this.list[index].price
    this.editPkgPrice = this.list[index].pkgPrice
  }

  closeEditMsg(index: number) {
    this.list[index].isEditing = false
    this.editPrice = ''
    this.editPkgPrice = ''
  }

  onEditPkgPriceChange(value: string) {
    const a = value.split('.')[0]
    const b = value.split('.')[1]
    if (b?.length > 2) {
      this.editPkgPrice = a + '.' + b.slice(0, 2)
    } else {
      this.editPkgPrice = value
    }
  }

  onEditPriceChange(value: string) {
    const a = value.split('.')[0]
    const b = value.split('.')[1]
    if (b?.length > 2) {
      this.editPrice = a + '.' + b.slice(0, 2)
    } else {
      this.editPrice = value
    }
  }

  @action
  updatePrice(index: number) {
    const basic_price = this.basic_prices[index]
    basic_price.price = this.editPrice
    return UpdateQuotationBasicPrice({ basic_prices: [basic_price] }).then(
      (res) => {
        return res.response
      },
    )
  }

  setPriceImportUploadUrl(url: string): void {
    this.priceImportUploadUrl = url
  }

  setPriceImportType(value: number) {
    this.priceImportType = value
  }

  @action
  sendPriceImportCreate() {
    return ImportQuotationCreateBySsu({
      // supplier_ids: this.importSupplier.map((e: any) => e.supplier_id),
      file_url: this.priceImportUploadUrl,
    }).then(() => this.setPriceImportUploadUrl(''))
  }

  @action
  sendPriceImportUpdate() {
    return ImportQuotationChangeBySsu({
      file_url: this.priceImportUploadUrl,
    }).then(() => this.setPriceImportUploadUrl(''))
  }
}

export default new Store()
