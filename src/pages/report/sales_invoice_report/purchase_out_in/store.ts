import { makeAutoObservable } from 'mobx'
import moment from 'moment'

import { MoreSelectDataItem } from '@gm-pc/react'
import { getTimestamp } from '@/common/util'
import { getCategoryName } from '@/pages/sales_invoicing/util2'
import _ from 'lodash'
import { PagingParams } from 'gm_api/src/common'

import {
  ExportPurchaseForms,
  GetSkuPurchaseInStockPrice,
  Additional,
  Warehouse,
  PurchaseFormsType,
} from 'gm_api/src/inventory'

import type {
  PurchaseStockValue,
  GetSkuPurchaseInStockPriceRequest,
  GetPurchaseFormsTaskDataByMerchandiseResponse_StockValue,
} from 'gm_api/src/inventory'
import { Sku } from 'gm_api/src/merchandise/types'
import globalStore from '@/stores/global'
import { GroupUser, Supplier } from 'gm_api/src/enterprise'

export type CommonListType =
  GetPurchaseFormsTaskDataByMerchandiseResponse_StockValue & {
    // 根据id处理后的列表展示字段
    sku_name?: string
    sku_base_unit_name?: string
    expiry_date?: number
    category_name?: string
    warehouse_name?: string
    purchase_name?: string
    supplier_name?: string
  }

export type ActiveKey =
  | 'search_by_sku'
  | 'search_by_supplier'
  | 'search_by_purchaser'
export type Filter = {
  warehouse_id?: string | number
  begin_time: Date
  end_time: Date
  // type?: PurchaseFormsType
  q: string
  purchaser_id?: string | number
  supplier_id?: string | number
  group_user_ids?: string
  category_id?: string
}

const initFilter = {
  warehouse_id: 0,
  begin_time: moment().startOf('day').subtract(1, 'month').toDate(),
  end_time: moment().endOf('day').toDate(),
  // type: PurchaseFormsType.TYPE_MERCHANDISE,
  q: '',
  supplier_id: 0,
  purchaser_id: 0,
  group_user_ids: undefined,
  category_id: undefined,
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** tabKey */
  activeKey: ActiveKey = 'search_by_sku'

  /** filter */
  filter: Filter = initFilter

  /** list */
  list: CommonListType[] = [{}]
  tableInfoStatistic: PurchaseStockValue = {}
  priceData: number[] = []
  rangeData: (string | null)[] = []

  modalData = {
    lastestPrice: '',
    supplier_name: '',
    purchase_name: '',
  }

  additional: Additional = {}

  get searchParams() {
    const { begin_time, end_time, supplier_id, purchaser_id, warehouse_id } =
      this.filter
    return {
      ...this.filter,
      begin_time: getTimestamp(begin_time),
      end_time: getTimestamp(end_time),
      supplier_id: supplier_id?.toString(),
      purchaser_id: purchaser_id?.toString(),
      warehouse_id: warehouse_id?.toString(),
    }
  }

  clear() {
    const { warehouse_id } = this.filter
    // TODO： 赶发版，权宜之计
    this.filter = Object.assign(initFilter, {
      warehouse_id: warehouse_id || 0,
    })
    this.list = []
  }

  fetchList(api: Function) {
    return async (params: PagingParams) => {
      const req = {
        ...params,
        ...this.searchParams,
        // type,
        with_additional: true,
      }
      const { response } = await api(req)
      const { additional = {}, stock_values, total_stock_value } = response
      this.additional = additional
      this.tableInfoStatistic = total_stock_value

      this.list = _.map(stock_values, (item) => {
        const { sku_id, warehouse_id, supplier_id, purchaser_id } = item
        const skuInfo = this.getAdditionInfo<Sku>('sku_map', sku_id!)
        const groupUser = this.getAdditionInfo<GroupUser>(
          'group_users',
          purchaser_id!,
        )
        const supplier = this.getAdditionInfo<Supplier>(
          'suppliers',
          supplier_id!,
        )
        const warehouse = this.getAdditionInfo<Warehouse>(
          'warehouses',
          warehouse_id,
        )
        const baseUnitName = globalStore.getUnitName(skuInfo?.base_unit_id)
        return {
          ...item,

          sku_name: skuInfo?.name,
          expiry_date: skuInfo?.expiry_date, // 保质期
          sku_base_unit_name: baseUnitName,
          warehouse_name: warehouse?.name,
          supplier_name: supplier?.name,
          purchase_name: groupUser?.name,
          category_name: getCategoryName(additional?.category_map, skuInfo!),
        }
      })

      return response
    }
  }

  /** 从additional里面获取需要的数据 */
  getAdditionInfo<k>(type: keyof Additional, key: string): k {
    return this.additional[type]?.[key] as k
  }

  /** 导出 */
  async export(task_type: number) {
    const req = _.assign(
      _.pick(this.searchParams, [
        'begin_time',
        'end_time',
        'warehouse_id',
        'purchaser_id',
        'supplier_id',
      ]),
      {
        task_type,
      },
    )
    const res = await ExportPurchaseForms(req)
    return res
  }

  /** 折线图数据 */
  async getPriceData(params: GetSkuPurchaseInStockPriceRequest) {
    const { begin_time, end_time } = this.filter

    const req = {
      begin_time: getTimestamp(begin_time),
      end_time: getTimestamp(end_time),
      sku_id: params?.sku_id!,
      warehouse_id: params?.warehouse_id!,
    }

    const { response } = await GetSkuPurchaseInStockPrice(req)
    const {
      last_purchase_in_stock_price,
      stock_values,
      supplier_id,
      purchaser_id,
      additional,
    } = response
    const supplier = additional?.suppliers?.[supplier_id!]
    const groupUser = additional?.group_users?.[purchaser_id!]

    this.modalData = {
      lastestPrice: last_purchase_in_stock_price!,
      supplier_name: supplier?.name!,
      purchase_name: groupUser?.name!,
    }

    this.priceData = _.map(stock_values!, (x) => {
      const price = _.toNumber(x?.price) || 0

      return price
    })

    this.rangeData = _.map(stock_values!, (x) =>
      x?.submit_date ? moment(+x?.submit_date * 1000).format('MM月DD日') : null,
    )
    return response
  }

  handleChangeActiveKey(activeKey: ActiveKey) {
    this.activeKey = activeKey
  }

  changeFilter<T extends keyof Filter>(key: T, value: Filter[T]) {
    this.filter[key] = value
  }
}

export default new Store()
