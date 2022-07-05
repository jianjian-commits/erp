import { observable, action, makeAutoObservable } from 'mobx'
import { t } from 'gm-i18n'
import _ from 'lodash'
import {
  ListCustomer,
  ListServicePeriod,
  Customer,
  ServicePeriod,
  GroupUser,
  DeleteCustomer,
  CustomerLabel,
  Customer_Type,
  BatchImportCustomer,
} from 'gm_api/src/enterprise'
import { Uint64Set } from 'gm_api/src/common'
import { Tip } from '@gm-pc/react'
import {
  ListQuotationV2,
  Quotation,
  Quotation_Type,
} from 'gm_api/src/merchandise'

import globalStore from '@/stores/global'
import { getRelationId, strToArr } from '../../util'
import { FilterOptions, ViewCustomer } from './type'
import { levelList, CustomerRequestParams } from '../../type'
import { options } from '../../enum'
import { ListWarehouse } from 'gm_api/src/inventory'
import type { Warehouse } from 'gm_api/src/inventory'

const PAGING = {
  offset: 0,
  limit: 999,
}

const INITFILTER: FilterOptions = {
  quotation_ids: { text: t('全部报价单'), value: '' },
  search_text: '',
  service_period_ids: '',
  city_id: '',
  district_id: '',
  street_id: '',
  credit_types: 0,
  customer_label_ids: '',
  create_group_user_ids: '',
  sales_group_user_ids: '',
  is_frozen: 0,
  is_in_whitelist: 0,
  warehouse_ids: '',
}
class Store {
  filter: FilterOptions = { ...INITFILTER }

  // 子customer list
  list: Customer[] = []

  viewList: ViewCustomer[] = []

  // 父customer list
  listParent: Customer[] = []

  customerLabelList: options[] = [{ value: '', text: t('全部') }]

  quotationList: levelList[] = [{ value: '', text: t('全部') }]

  listServicePeriod: options[] = [{ value: '', text: t('全部') }]

  batchImportUploadUrl = ''

  count = 0
  service_period_relation: { [key: string]: Uint64Set } = {}
  group_users: { [key: string]: GroupUser } = {}
  customer_labels: { [key: string]: CustomerLabel } = {}
  warehouseList: Warehouse[] = []

  initBatchImportUploadUrl(): void {
    this.batchImportUploadUrl = ''
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateFilter<T extends keyof FilterOptions>(value: FilterOptions[T], key: T) {
    this.filter[key] = value
  }

  getSearchData() {
    const {
      quotation_ids,
      create_group_user_ids,
      sales_group_user_ids,
      service_period_ids,
      credit_types,
      city_id,
      district_id,
      customer_label_ids,
      search_text,
      street_id,
      warehouse_ids,
      ...rest
    } = this.filter

    return {
      quotation_ids: strToArr(quotation_ids?.value),
      create_group_user_ids: create_group_user_ids
        ? [create_group_user_ids]
        : [],
      sales_group_user_ids: sales_group_user_ids ? [sales_group_user_ids] : [],
      service_period_ids: service_period_ids ? [service_period_ids] : [],
      customer_label_ids: customer_label_ids ? [customer_label_ids] : [],
      credit_types: credit_types || null,
      city_ids: city_id ? [city_id] : [],
      district_ids: district_id ? [district_id] : [],
      need_quotations: true,
      need_group_users: true,
      need_service_periods: true,
      need_customer_label: true,
      level: 2,
      q: search_text,
      type: Customer_Type.TYPE_SOCIAL,
      street_ids: strToArr(street_id),
      warehouse_ids: warehouse_ids ? [warehouse_ids] : [],
      ...rest,
    }
  }

  fetchQuotation() {
    ListQuotationV2({
      paging: PAGING,
      filter_params: {
        // 筛选周期报价单父报价单，则传 0
        parent_quotation_ids: ['0'],
        quotation_types: [Quotation_Type.WITHOUT_TIME, Quotation_Type.PERIODIC],
      },
    }).then((json) => {
      const quotation = _.map(json.response.quotations, (item: Quotation) => {
        return {
          value: item.quotation_id,
          text: item.inner_name || '',
        }
      })
      this.quotationList = quotation
      return json.response
    })
  }

  fetchServicePeriod() {
    const req = { paging: PAGING }
    ListServicePeriod(req).then((json) => {
      const service_period = _.map(
        json.response.service_periods,
        (item: ServicePeriod) => {
          return {
            value: item.service_period_id,
            text: item.name || '',
          }
        },
      )
      this.listServicePeriod = service_period
      return json.response
    })
  }

  fetchList(params: CustomerRequestParams) {
    const req = Object.assign({ paging: params.paging }, this.getSearchData())

    return ListCustomer(req).then((json) => {
      this.list = json.response.customers || []
      this.count = json.response.paging?.count || 0
      this.service_period_relation = json.response.service_period_relation!
      this.group_users = json.response.group_users!
      this.customer_labels = json.response.customer_labels!
      console.log(this.list, 'this.list')

      this.viewList = _.map(this.list, (item) => {
        const quotation_id = getRelationId(
          json.response.quotation_relations!,
          item.customer_id,
          globalStore.userInfo.station_id!,
          [Quotation_Type.WITHOUT_TIME, Quotation_Type.PERIODIC],
        )
        const menu_id = getRelationId(
          json.response.quotation_relations!,
          item.customer_id,
          globalStore.userInfo.station_id!,
          Quotation_Type.WITH_TIME, // 菜谱
        )
        const service_period_id =
          this.service_period_relation[item.customer_id]?.values || []
        const customer_label_id =
          json.response.customer_label_relation![item.customer_id]?.values || []

        return {
          ...item,
          quotation_id,
          service_period_id,
          customer_label_id,
          menu_id,
        }
      })

      return json.response
    })
  }

  fetchParentList() {
    const req = Object.assign(
      { paging: PAGING },
      { level: 1, type: Customer_Type.TYPE_SOCIAL },
    )

    return ListCustomer(req).then((json) => {
      this.listParent = json.response.customers || []
      return null
    })
  }

  delCustomer(customer_id: string) {
    return DeleteCustomer({ customer_id }).then(() => {
      return Tip.success(t('删除成功'))
    })
  }

  reset(): void {
    this.filter = { ...INITFILTER }
  }

  // doRequest(func: () => void) {
  //   this.doFirstRequest = func
  // }

  setBatchImportUploadUrl(url: string): void {
    this.batchImportUploadUrl = url
  }

  sendBatchImportCustomer() {
    return BatchImportCustomer({
      file_url: this.batchImportUploadUrl,
      customer_type: Customer_Type.TYPE_SOCIAL,
    }).then(() => {
      this.initBatchImportUploadUrl()
    })
  }

  getWarehouselist(warehouses: Warehouse[]) {
    this.warehouseList = warehouses
    // ListWarehouse({
    //   paging: { limit: 999, offset: 0 },
    //   valid: 1, // 查看已启用的
    // }).then((json) => {
    //   const { warehouses } = json.response
    //   this.warehouseList = warehouses
    // })
  }

  getWarehouseById(warehouseId: string) {
    return this.warehouseList.find((w) => w.warehouse_id === warehouseId) || {}
  }
}

export default new Store()
