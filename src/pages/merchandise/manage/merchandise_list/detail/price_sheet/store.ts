import { Key } from 'react'
import { makeAutoObservable } from 'mobx'
import {
  ListBasicPriceV2,
  ListBasicPriceV2Request_RequestData,
  SetBasicPriceV2,
  DeleteManyBasicPriceV2,
  Quotation,
  Quotation_Type,
  GetSkuReferencePricesResponse_ReferencePrices,
} from 'gm_api/src/merchandise'
import baseStore from '../store'
import { getUnitGroupList } from '@/pages/merchandise/util'
import {
  ChildrenType,
  DataType,
} from '@/pages/merchandise/price_manage/customer_quotation/data'
import { PagingParams } from 'gm_api/src/common'
import _ from 'lodash'
import { getChildEffectiveTime } from '@/pages/merchandise/manage/util'

export type FilterType = {
  quotation_q: string
  on_shelf?: number
  bp_on_shelf_type_list?: number[]
}

class ListStore {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clearStore() {
    this.list = []
    this.filter = {
      quotation_q: '',
      on_shelf: 0,
    }
    this.selected = []
    this.expandedRowKeys = []
    this.selectedRowKeys = []
    this.pagination = { offset: 0, limit: 10, need_count: true }
    this.paging = { current: 1, pageSize: 10 }
    this.quotationMap = {}
  }

  /** 商品列表 */
  list: DataType[] = []

  filter: FilterType = {
    quotation_q: '',
    on_shelf: 0,
  }

  selectedRowKeys: Key[] = []

  /** 展开的Id集合 */
  expandedRowKeys: readonly Key[] = []

  count = 0

  loading = false

  /** 页码信息传参数用 */
  pagination: PagingParams = { offset: 0, limit: 10, need_count: true }

  /** antd 表格分页信息 */
  paging = { current: 1, pageSize: 10 }

  /** 已选择的items */
  selected: ChildrenType[] = []

  /** 最近报价|最近采购价|最近入库价 */
  priceOf: keyof GetSkuReferencePricesResponse_ReferencePrices =
    'quotation_reference_prices'

  /** 当前页报价单map */
  quotationMap: { [key: string]: Quotation } = {}

  setSelectedRowKeys(selectedRowKeys: Key[]) {
    this.selectedRowKeys = selectedRowKeys
  }

  setFilter(filter: FilterType) {
    this.filter = { ...filter }
    this.fetchList(undefined, true)
  }

  setSelected(selected: ChildrenType[]) {
    this.selected = selected
  }

  setPaging(paging: { current: number; pageSize: number }) {
    this.paging = paging
  }

  setPagination(pagination: PagingParams) {
    this.pagination = pagination
  }

  setExpandedRowKeys(keys: readonly Key[]) {
    this.expandedRowKeys = keys
  }

  /**
   * 获取报价单下商品列表
   * @param sku_id 报价单Id
   * @param isResetCurrent 页码是否重置为1
   */
  fetchList(sku_id?: string, isResetCurrent?: boolean) {
    this.loading = true
    if (isResetCurrent) {
      this.pagination.offset = 0
      this.setPaging({ pageSize: this.pagination.limit, current: 1 })
    }

    const filter = _.cloneDeep(this.filter)

    const { on_shelf } = filter
    if (on_shelf) {
      filter.bp_on_shelf_type_list = [on_shelf, 3]
      delete filter.on_shelf
    }

    const req = {
      filter_params: {
        ...filter,
        periodic_time: `${Date.now()}`,
        sku_id: sku_id || baseStore.skuId,
        quotation_types: [Quotation_Type.WITHOUT_TIME, Quotation_Type.PERIODIC],
      },
      request_data: ListBasicPriceV2Request_RequestData.RD_UNSPECIFIED,
      paging: this.pagination,
    }
    ListBasicPriceV2(req)
      .then((res) => {
        const {
          sku_map = {},
          basic_prices = [],
          quotation_map = {},
          paging,
        } = res.response

        this.quotationMap = quotation_map

        const list = basic_prices.map((item) => {
          const { sku_id = '', items, quotation_id = '' } = item

          const { inner_name, parent_child_inner_name, type } =
            quotation_map[quotation_id]
          let name = inner_name
          if (type === Quotation_Type.PERIODIC) {
            name = `${parent_child_inner_name} ${getChildEffectiveTime(
              quotation_map[quotation_id],
            )}`
          }
          return {
            id: quotation_id,
            name,
            basic_price_id: item.basic_price_id,
            sku_id: item.sku_id,
            items:
              items?.basic_price_items?.map((item) => ({
                ...item,
                id: item.order_unit_id + '/' + quotation_id,
                parentId: quotation_id,
                units: getUnitGroupList(sku_map[sku_id]),
              })) || [],
          }
        })
        this.list = list || []
        this.selected = []
        this.expandedRowKeys = list.map((item) => item.id)
        this.selectedRowKeys = []
        /** 后台业务上只有在第一页的时候，才会返回count */
        if (this.pagination.offset === 0) {
          this.count = Number(paging.count || '0')
        }
      })
      .finally(() => (this.loading = false))
  }

  /**
   * 提交绑定商品条目 与 删除条目共用
   */
  onSubmit(data: ChildrenType[], quotation_id: string) {
    const params = {
      basic_prices: [
        {
          sku_id: baseStore.skuId,
          quotation_id,
          items: {
            basic_price_items: data.map((m) => ({
              order_unit_id: Number(m.order_unit_id),
              minimum_order_number: String(m.minimum_order_number),
              fee_unit_price: {
                val: String(m.fee_unit_price.val || '0'),
                unit_id: m.fee_unit_price.unit_id,
              },
              on_shelf: m.on_shelf,
              pricing_formula: m.pricing_formula,
              pricing_type: m.pricing_type,
              formula_text: m.formula_text,
              current_price: m.current_price,
            })),
          },
        },
      ],
    }
    return SetBasicPriceV2(params as any).then((res) => {
      console.log('res', res)
    })
  }

  /**
   * 删除商品下所有条目
   */
  handleDeleteItems(quotation_id: string) {
    return DeleteManyBasicPriceV2({
      basic_price_ids: [
        {
          quotation_id,
          sku_id: baseStore.skuId,
        },
      ],
    } as any)
  }
}

export default new ListStore()
